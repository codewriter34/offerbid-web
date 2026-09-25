import { loadOlm } from "./olmLoader";
import {
  getAccountPickle,
  saveAccountPickle,
  getSessionPickle,
  saveSessionPickle,
  hasStoredSession,
  recordOneTimeKeys,
  pruneOldOneTimeKeyRecords,
  getMeta,
  setMeta,
  getCachedPeerDevices,
  saveCachedPeerDevices,
  deleteCachedPeerDevices,
} from "./store";
import { getOrCreateDeviceId, getOrCreateRegistrationId } from "./deviceId";
import type {
  EnvelopeType,
  MessageEnvelope,
  PeerDeviceBundle,
  UploadKeysPayload,
} from "@/types";

/**
 * This module is the only place in the app that touches Olm directly.
 * Nothing in here ever logs plaintext or ciphertext -- only ids and
 * high-level outcomes (e.g. "decrypt_failed"), even in catch blocks, per the
 * spec's explicit requirement. If you're adding a log line here, make sure
 * it can't end up echoing a WASM exception message that might contain
 * message bytes.
 */

export class ChatCryptoError extends Error {
  code: string;
  constructor(code: string, message: string) {
    super(message);
    this.name = "ChatCryptoError";
    this.code = code;
  }
}

// ---- account lifecycle ----

const PICKLE_KEY_META = "picklePassphrase";
const SIGNED_PREKEY_ID_META = "signedPreKeyId";
const SIGNED_PREKEY_ROTATED_AT_META = "signedPreKeyRotatedAt";
const NEXT_OTK_ID_META = "nextOneTimeKeyId";

// Rotate the fallback ("signed prekey") key about once a week. This is an
// arbitrary, documented choice -- Olm/Signal don't mandate a cadence for
// this. Weekly bounds how long a single signed-prekey signature stays in
// circulation without adding much upload overhead (it piggybacks on the
// same POST /chats/keys call we already make to replenish one-time keys).
const SIGNED_PREKEY_ROTATION_MS = 7 * 24 * 60 * 60 * 1000;

// Always top up to this many *unpublished* one-time keys per upload. Must
// stay within the API's accepted range of 10-100. POST /chats/keys REPLACES
// the server's entire pool every call, so this is not "how many to add" --
// it's "how many to have outstanding after this call".
const OTK_TARGET_COUNT = 30;

function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

async function getPicklePassphrase(): Promise<string> {
  const existing = await getMeta(PICKLE_KEY_META);
  if (existing) return existing;
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  const passphrase = bytesToBase64(bytes);
  await setMeta(PICKLE_KEY_META, passphrase);
  return passphrase;
}

type Olm = Awaited<ReturnType<typeof loadOlm>>;

let accountSingleton: { Olm: Olm; account: InstanceType<Olm["Account"]> } | null =
  null;

async function ensureAccount() {
  if (accountSingleton) return accountSingleton;
  const OlmNs = await loadOlm();
  const account = new OlmNs.Account();
  const pickle = await getAccountPickle();
  const passphrase = await getPicklePassphrase();
  if (pickle) {
    account.unpickle(passphrase, pickle);
  } else {
    account.create();
    await saveAccountPickle(account.pickle(passphrase));
  }
  accountSingleton = { Olm: OlmNs, account };
  return accountSingleton;
}

async function persistAccount(
  account: InstanceType<Olm["Account"]>,
  passphrase: string,
) {
  await saveAccountPickle(account.pickle(passphrase));
}

export async function getIdentityKeys(): Promise<{
  curve25519: string;
  ed25519: string;
}> {
  const { account } = await ensureAccount();
  return JSON.parse(account.identity_keys());
}

// ---- key upload payload (X3DH-style bundle: identity + signed prekey +
// one-time prekeys) ----
//
// DEVIATION FROM BRIEF (documented deliberately): the brief describes
// emulating a Signal-style "signed prekey" by manually generating one extra
// one-time key and excluding it from the uploaded OTK batch. Olm ships a
// purpose-built equivalent for exactly this need: a "fallback key"
// (generate_fallback_key / fallback_key / unpublished_fallback_key /
// forget_old_fallback_key, all present on Account per
// node_modules/@matrix-org/olm/index.d.ts). A fallback key already behaves
// the way the brief wants a signed prekey to behave -- one persistent key
// handed out only when the regular one-time-key pool is exhausted -- and it
// is automatically excluded from account.one_time_keys(), so there's no
// manual bookkeeping needed to keep it out of the uploaded OTK batch (unlike
// the manual approach, which would require remembering "this one id is
// special" everywhere). We use the fallback-key API instead of the manual
// approach for that reason; the resulting wire shape (a signed public key
// uploaded via signedPreKeyId/signedPreKey/signedPreKeySig, separate from
// the OTK pool) is identical to what the brief specifies.

interface PreparedKeyUpload {
  payload: UploadKeysPayload;
  /** Call only after the payload has been successfully POSTed to the server. */
  commit: () => Promise<void>;
}

export async function prepareKeyUpload(opts?: {
  rotateSignedPreKey?: boolean;
}): Promise<PreparedKeyUpload> {
  const { account } = await ensureAccount();
  const passphrase = await getPicklePassphrase();
  const deviceId = await getOrCreateDeviceId();
  const registrationId = await getOrCreateRegistrationId();

  // 1. Top up one-time keys to our target outstanding count.
  const currentOtks = JSON.parse(account.one_time_keys()).curve25519 as Record<
    string,
    string
  >;
  const currentCount = Object.keys(currentOtks).length;
  if (currentCount < OTK_TARGET_COUNT) {
    account.generate_one_time_keys(OTK_TARGET_COUNT - currentCount);
  }

  // 2. Rotate the fallback ("signed prekey") key if it's due, forced, or we
  // have never generated one.
  const rotatedAtRaw = await getMeta(SIGNED_PREKEY_ROTATED_AT_META);
  const rotatedAt = rotatedAtRaw ? Number(rotatedAtRaw) : 0;
  const shouldRotate =
    Boolean(opts?.rotateSignedPreKey) ||
    !rotatedAtRaw ||
    Date.now() - rotatedAt > SIGNED_PREKEY_ROTATION_MS;
  if (shouldRotate) {
    account.generate_fallback_key();
  }

  // Snapshot exactly which one-time keys are about to be published, with
  // stable integer ids we assign (Olm's own key ids are opaque strings, but
  // the API requires an int).
  const pendingOtks = JSON.parse(account.one_time_keys()).curve25519 as Record<
    string,
    string
  >;
  const nextIdRaw = await getMeta(NEXT_OTK_ID_META);
  let nextId = nextIdRaw ? Number(nextIdRaw) : 1;
  const oneTimePreKeys: { keyId: number; publicKey: string }[] = [];
  for (const publicKey of Object.values(pendingOtks)) {
    oneTimePreKeys.push({ keyId: nextId, publicKey });
    nextId += 1;
  }

  // The public key to sign and upload as the "signed prekey". If we just
  // rotated, the newly generated key is still "unpublished" until
  // mark_keys_as_published() runs, so read it from
  // unpublished_fallback_key() rather than fallback_key().
  const fallbackSource = shouldRotate
    ? account.unpublished_fallback_key()
    : account.fallback_key();
  const fallbackKeys = JSON.parse(fallbackSource).curve25519 as Record<
    string,
    string
  >;
  const signedPreKeyPublicKey = Object.values(fallbackKeys)[0];
  if (!signedPreKeyPublicKey) {
    throw new ChatCryptoError(
      "SIGNED_PREKEY_MISSING",
      "Could not derive a signed prekey",
    );
  }
  const signedPreKeySig = account.sign(signedPreKeyPublicKey);

  let signedPreKeyId = Number((await getMeta(SIGNED_PREKEY_ID_META)) ?? "0");
  if (shouldRotate || signedPreKeyId === 0) {
    signedPreKeyId += 1;
  }

  const { curve25519: identityKey } = JSON.parse(account.identity_keys());

  const payload: UploadKeysPayload = {
    deviceId,
    registrationId,
    identityKey,
    signedPreKeyId,
    signedPreKey: signedPreKeyPublicKey,
    signedPreKeySig,
    oneTimePreKeys,
  };

  const commit = async () => {
    // Publish: after this, account.one_time_keys() stops listing the keys
    // above, and fallback_key() returns the (possibly newly rotated) key.
    // If we rotated, the *previous* fallback key moves into Olm's internal
    // "old fallback key" slot rather than being discarded outright, so a
    // peer who fetched it moments before rotation can still complete a
    // PREKEY handshake against it; we never call forget_old_fallback_key()
    // in this app, deliberately, for the same 90-day-retention reasoning
    // documented below for regular one-time keys.
    account.mark_keys_as_published();
    await persistAccount(account, passphrase);
    await recordOneTimeKeys(oneTimePreKeys);
    await setMeta(NEXT_OTK_ID_META, String(nextId));
    if (shouldRotate) {
      await setMeta(SIGNED_PREKEY_ID_META, String(signedPreKeyId));
      await setMeta(SIGNED_PREKEY_ROTATED_AT_META, String(Date.now()));
    }
    // OTPK RETENTION: POST /chats/keys replaces the server's entire
    // one-time-prekey pool on every call. A peer may have already fetched
    // one of our *previous* batch's keys from the server (consuming it
    // there) without having sent their first message yet -- if we discarded
    // the matching local private key material the moment we replenished,
    // we could never decrypt their inbound PREKEY message. We never
    // proactively delete OTK private material from the Olm account; it only
    // leaves the account when `account.remove_one_time_keys(session)` runs,
    // which we only call after successfully decrypting an inbound message
    // that used it (see decryptEnvelope below). pruneOldOneTimeKeyRecords()
    // below only prunes our *bookkeeping* rows (id <-> pubkey mapping) past
    // a 90-day window; it does not touch the account's private key state.
    void pruneOldOneTimeKeyRecords();
  };

  return { payload, commit };
}

// ---- signature verification for the signed-prekey fallback path ----

/**
 * IMPORTANT CAVEAT -- flag for security review: Ed25519 signature
 * verification needs the signer's Ed25519 public key. The deployed chat
 * API's GET /chats/keys/:peerUserId response only exposes a single
 * `identityKey` field, documented as the account's *Curve25519* identity key
 * (the one used for X3DH-style session establishment via
 * Session.create_outbound). Olm accounts actually have both a Curve25519 and
 * an Ed25519 identity keypair (see identity_keys()), but only the Curve25519
 * one crosses the wire in this API's current contract -- there is no
 * separate Ed25519 field to verify against.
 *
 * Given that gap, this function cannot provide a real cryptographic
 * guarantee today. Rather than silently downgrading security (accepting an
 * unverifiable signed prekey as if it were verified), it fails closed:
 * verification is attempted with the only key we have, and if it does not
 * succeed, callers must refuse to use the signed-prekey fallback path. In
 * practice, given the key-type mismatch, this means the fallback path (used
 * when a peer's one-time-prekey pool is exhausted) is effectively unusable
 * until the API adds a real Ed25519 identity key to the bundle response. A
 * human should confirm this with the backend team -- see this PR's summary.
 */
export async function verifySignedPreKey(
  peerIdentityKey: string,
  signedPreKeyPublicKey: string,
  signature: string,
): Promise<boolean> {
  try {
    const { Olm: OlmNs } = await ensureAccount();
    const utility = new OlmNs.Utility();
    try {
      utility.ed25519_verify(peerIdentityKey, signedPreKeyPublicKey, signature);
      return true;
    } catch {
      return false;
    } finally {
      utility.free();
    }
  } catch {
    return false;
  }
}

// ---- outbound: establish/reuse a session with one peer device and encrypt ----

export interface EncryptResult {
  type: EnvelopeType;
  ciphertext: string;
}

export async function hasSessionWithDevice(
  peerUserId: string,
  peerDeviceId: string,
): Promise<boolean> {
  return hasStoredSession(peerUserId, peerDeviceId);
}

export async function encryptForPeerDevice(params: {
  peerUserId: string;
  device: PeerDeviceBundle;
  plaintext: string;
}): Promise<EncryptResult> {
  const { peerUserId, device, plaintext } = params;
  const { Olm: OlmNs, account } = await ensureAccount();
  const passphrase = await getPicklePassphrase();

  const existingPickle = await getSessionPickle(peerUserId, device.deviceId);
  const session = new OlmNs.Session();
  try {
    if (existingPickle) {
      session.unpickle(passphrase, existingPickle);
    } else {
      // No session yet: establish one. Prefer a genuine one-time prekey;
      // only fall back to the signed prekey (with mandatory signature
      // verification -- see verifySignedPreKey's caveat above) if the
      // peer's one-time-prekey pool was already exhausted server-side.
      let keyForSession: string;
      if (device.oneTimePreKey) {
        keyForSession = device.oneTimePreKey.publicKey;
      } else {
        const verified = await verifySignedPreKey(
          device.identityKey,
          device.signedPreKey.publicKey,
          device.signedPreKey.signature,
        );
        if (!verified) {
          throw new ChatCryptoError(
            "SIGNATURE_INVALID",
            "Could not verify this device's signed prekey",
          );
        }
        keyForSession = device.signedPreKey.publicKey;
      }
      session.create_outbound(account, device.identityKey, keyForSession);
    }

    const { type, body } = session.encrypt(plaintext);
    await saveSessionPickle(peerUserId, device.deviceId, session.pickle(passphrase));
    return { type: type === 0 ? "PREKEY" : "RATCHET", ciphertext: body };
  } finally {
    session.free();
  }
}

export async function getPeerDeviceEnvelope(
  peerUserId: string,
  device: PeerDeviceBundle,
  plaintext: string,
): Promise<MessageEnvelope> {
  const result = await encryptForPeerDevice({ peerUserId, device, plaintext });
  return {
    recipientUserId: peerUserId,
    recipientDeviceId: device.deviceId,
    type: result.type,
    // Olm's session.encrypt() returns a single opaque `body` blob that
    // already embeds whatever header a PREKEY message needs (the one-time
    // key id, base identity key, base ephemeral key) inside its own wire
    // format -- there is no separately encoded header the way raw
    // Signal/libsignal messages expose one. We map the whole blob to the
    // API's `ciphertext` field and leave `header` unset; the API defines it
    // as optional for exactly this kind of adaptation.
    ciphertext: result.ciphertext,
  };
}

// ---- inbound: decrypt an envelope addressed to us ----

export interface DecryptOutcome {
  plaintext: string | null;
  error?: "decrypt_failed" | "no_session_for_ratchet_message";
}

export async function decryptEnvelope(params: {
  senderUserId: string;
  senderDeviceId: string;
  type: EnvelopeType;
  ciphertext: string;
}): Promise<DecryptOutcome> {
  const { senderUserId, senderDeviceId, type, ciphertext } = params;
  const { Olm: OlmNs, account } = await ensureAccount();
  const passphrase = await getPicklePassphrase();
  const messageType = type === "PREKEY" ? 0 : 1;

  const existingPickle = await getSessionPickle(senderUserId, senderDeviceId);

  if (existingPickle) {
    const session = new OlmNs.Session();
    try {
      session.unpickle(passphrase, existingPickle);
      const plaintext = session.decrypt(messageType, ciphertext);
      await saveSessionPickle(senderUserId, senderDeviceId, session.pickle(passphrase));
      return { plaintext };
    } catch {
      if (messageType !== 0) {
        // A RATCHET message we can't decrypt against our stored session --
        // never log the underlying error, it can echo ciphertext fragments.
        return { plaintext: null, error: "decrypt_failed" };
      }
      // Otherwise fall through: a PREKEY message that doesn't match our
      // existing session can happen if the peer started a fresh session
      // (e.g. they lost local state). Try establishing a new inbound
      // session below instead.
    } finally {
      session.free();
    }
  }

  if (messageType !== 0) {
    return { plaintext: null, error: "no_session_for_ratchet_message" };
  }

  const session = new OlmNs.Session();
  try {
    session.create_inbound(account, ciphertext);
    const plaintext = session.decrypt(messageType, ciphertext);
    // Consume/forget the one-time key this PREKEY message used, now that
    // we've successfully established the session with it.
    account.remove_one_time_keys(session);
    await persistAccount(account, passphrase);
    await saveSessionPickle(senderUserId, senderDeviceId, session.pickle(passphrase));
    return { plaintext };
  } catch {
    return { plaintext: null, error: "decrypt_failed" };
  } finally {
    session.free();
  }
}

// ---- peer device list cache (crypto-layer wrapper over store.ts, so
// callers outside lib/signal only ever import from here) ----

export type CachedPeerDevice = Pick<
  PeerDeviceBundle,
  "deviceId" | "registrationId" | "identityKey"
>;

export async function getCachedPeerDeviceList(
  peerUserId: string,
): Promise<CachedPeerDevice[]> {
  const devices = await getCachedPeerDevices(peerUserId);
  return devices ?? [];
}

export async function setCachedPeerDeviceList(
  peerUserId: string,
  devices: CachedPeerDevice[],
): Promise<void> {
  await saveCachedPeerDevices(peerUserId, devices);
}

export async function invalidatePeerDeviceCache(
  peerUserId: string,
): Promise<void> {
  await deleteCachedPeerDevices(peerUserId);
}
