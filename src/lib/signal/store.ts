import { openDB, type DBSchema, type IDBPDatabase } from "idb";

/**
 * All Signal-protocol key material (identity account pickle, per-device
 * session ratchets, one-time-key bookkeeping) lives in IndexedDB, never
 * localStorage -- this is an explicit requirement, not a style choice:
 * localStorage is trivially readable by any same-origin script and some
 * browser extensions, and there is no reason to make private key material
 * that available when IndexedDB (equally same-origin, but not exposed via a
 * synchronous global) works just as well for our access patterns.
 */

const DB_NAME = "offerbid-signal";
const DB_VERSION = 1;

interface PeerDeviceRecord {
  deviceId: string;
  registrationId: number;
  identityKey: string;
}

interface SignalDB extends DBSchema {
  meta: {
    key: string;
    value: { key: string; value: string };
  };
  account: {
    key: string;
    value: { id: string; pickle: string; updatedAt: string };
  };
  sessions: {
    key: string;
    value: {
      id: string;
      peerUserId: string;
      peerDeviceId: string;
      pickle: string;
      updatedAt: string;
    };
  };
  oneTimeKeys: {
    key: number;
    value: {
      keyId: number;
      publicKey: string;
      createdAt: string;
      consumedAt: string | null;
    };
    indexes: { "by-createdAt": string };
  };
  peerDevices: {
    key: string;
    value: {
      peerUserId: string;
      devices: PeerDeviceRecord[];
      updatedAt: string;
    };
  };
}

let dbPromise: Promise<IDBPDatabase<SignalDB>> | null = null;

function getDb(): Promise<IDBPDatabase<SignalDB>> {
  if (typeof window === "undefined" || !("indexedDB" in window)) {
    throw new Error("Chat encryption storage (IndexedDB) is not available");
  }
  if (!dbPromise) {
    dbPromise = openDB<SignalDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("meta")) {
          db.createObjectStore("meta", { keyPath: "key" });
        }
        if (!db.objectStoreNames.contains("account")) {
          db.createObjectStore("account", { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains("sessions")) {
          db.createObjectStore("sessions", { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains("oneTimeKeys")) {
          const store = db.createObjectStore("oneTimeKeys", {
            keyPath: "keyId",
          });
          store.createIndex("by-createdAt", "createdAt");
        }
        if (!db.objectStoreNames.contains("peerDevices")) {
          db.createObjectStore("peerDevices", { keyPath: "peerUserId" });
        }
      },
    });
  }
  return dbPromise;
}

// ---- meta (small scalar values: deviceId, registrationId, pickle passphrase,
// signed-prekey rotation bookkeeping, one-time-key id counter) ----

export async function getMeta(key: string): Promise<string | null> {
  const db = await getDb();
  const row = await db.get("meta", key);
  return row?.value ?? null;
}

export async function setMeta(key: string, value: string): Promise<void> {
  const db = await getDb();
  await db.put("meta", { key, value });
}

// ---- account (the single Olm.Account for this device, pickled) ----

const ACCOUNT_ID = "self";

export async function getAccountPickle(): Promise<string | null> {
  const db = await getDb();
  const row = await db.get("account", ACCOUNT_ID);
  return row?.pickle ?? null;
}

export async function saveAccountPickle(pickle: string): Promise<void> {
  const db = await getDb();
  await db.put("account", {
    id: ACCOUNT_ID,
    pickle,
    updatedAt: new Date().toISOString(),
  });
}

// ---- sessions (one Double Ratchet session per peer device, pickled) ----

function sessionKey(peerUserId: string, peerDeviceId: string): string {
  return `${peerUserId}:${peerDeviceId}`;
}

export async function getSessionPickle(
  peerUserId: string,
  peerDeviceId: string,
): Promise<string | null> {
  const db = await getDb();
  const row = await db.get("sessions", sessionKey(peerUserId, peerDeviceId));
  return row?.pickle ?? null;
}

export async function saveSessionPickle(
  peerUserId: string,
  peerDeviceId: string,
  pickle: string,
): Promise<void> {
  const db = await getDb();
  await db.put("sessions", {
    id: sessionKey(peerUserId, peerDeviceId),
    peerUserId,
    peerDeviceId,
    pickle,
    updatedAt: new Date().toISOString(),
  });
}

export async function hasStoredSession(
  peerUserId: string,
  peerDeviceId: string,
): Promise<boolean> {
  const db = await getDb();
  const row = await db.get("sessions", sessionKey(peerUserId, peerDeviceId));
  return Boolean(row);
}

// ---- one-time-key bookkeeping ----
//
// The private key material for a one-time key lives inside the Olm.Account
// pickle itself (Olm keeps it until we explicitly call
// account.remove_one_time_keys()), so this store is NOT where the private
// key bytes live -- it exists purely so we can (a) hand the server a stable
// integer `keyId` for each public key we upload (Olm's own internal key ids
// are opaque strings, not the integers POST /chats/keys requires) and (b)
// know how old an uploaded-but-possibly-still-outstanding key is, for the
// 90-day retention policy documented in crypto.ts.

export async function recordOneTimeKeys(
  keys: Array<{ keyId: number; publicKey: string }>,
): Promise<void> {
  if (keys.length === 0) return;
  const db = await getDb();
  const tx = db.transaction("oneTimeKeys", "readwrite");
  await Promise.all(
    keys.map((k) =>
      tx.store.put({
        keyId: k.keyId,
        publicKey: k.publicKey,
        createdAt: new Date().toISOString(),
        consumedAt: null,
      }),
    ),
  );
  await tx.done;
}

const RETENTION_MS = 90 * 24 * 60 * 60 * 1000; // 90 days -- see crypto.ts

/**
 * Deletes only the local *bookkeeping rows* for one-time keys uploaded more
 * than 90 days ago. This does not (and must not) touch the Olm account's
 * own internal one-time-key private material -- that is pruned by Olm
 * itself via `account.remove_one_time_keys()` once a key is actually used to
 * establish an inbound session (see crypto.ts `decryptEnvelope`). This is
 * just cleanup of our own metadata table so it doesn't grow forever.
 */
export async function pruneOldOneTimeKeyRecords(): Promise<void> {
  const db = await getDb();
  const cutoff = Date.now() - RETENTION_MS;
  const all = await db.getAll("oneTimeKeys");
  const stale = all.filter(
    (row) => new Date(row.createdAt).getTime() < cutoff,
  );
  if (stale.length === 0) return;
  const tx = db.transaction("oneTimeKeys", "readwrite");
  await Promise.all(stale.map((row) => tx.store.delete(row.keyId)));
  await tx.done;
}

// ---- peer device list cache (avoids re-hitting GET /chats/keys/:peerUserId,
// which consumes a one-time prekey per device, on every message send) ----

export async function getCachedPeerDevices(
  peerUserId: string,
): Promise<PeerDeviceRecord[] | null> {
  const db = await getDb();
  const row = await db.get("peerDevices", peerUserId);
  return row?.devices ?? null;
}

export async function saveCachedPeerDevices(
  peerUserId: string,
  devices: PeerDeviceRecord[],
): Promise<void> {
  const db = await getDb();
  await db.put("peerDevices", {
    peerUserId,
    devices,
    updatedAt: new Date().toISOString(),
  });
}

export async function deleteCachedPeerDevices(
  peerUserId: string,
): Promise<void> {
  const db = await getDb();
  await db.delete("peerDevices", peerUserId);
}
