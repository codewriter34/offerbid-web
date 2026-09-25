import { prepareKeyUpload } from "@/lib/signal/crypto";
import { getOrCreateDeviceId } from "@/lib/signal/deviceId";
import { uploadChatKeys, fetchMyChatDevices } from "@/features/api/services";

const MIN_OTK_THRESHOLD = 10;

/**
 * Builds a fresh key-upload payload from the local Olm account (creating
 * the account/device identity on first ever call) and POSTs it, then
 * commits the resulting state locally only once the upload has succeeded.
 * Called at login (see Providers.tsx) and defensively whenever the server
 * tells us it doesn't recognize our device (CHAT_DEVICE_UNKNOWN).
 */
export async function ensureChatKeysUploaded(opts?: {
  forceRotateSignedPreKey?: boolean;
}): Promise<void> {
  const { payload, commit } = await prepareKeyUpload({
    rotateSignedPreKey: opts?.forceRotateSignedPreKey,
  });
  await uploadChatKeys(payload);
  await commit();
}

/**
 * Checks the server's view of our own device's outstanding one-time-prekey
 * count and replenishes (re-uploads) if it's running low, or if the server
 * doesn't know about this device at all yet. Safe to call repeatedly (e.g.
 * on every app open) -- it's a no-op read plus, at most, one upload.
 */
export async function replenishChatKeysIfLow(): Promise<void> {
  const deviceId = await getOrCreateDeviceId();
  const { devices } = await fetchMyChatDevices();
  const mine = devices.find((d) => d.deviceId === deviceId);
  if (!mine || mine.oneTimePreKeyCount < MIN_OTK_THRESHOLD) {
    await ensureChatKeysUploaded();
  }
}

/**
 * Best-effort bootstrap entry point: never throws, so a transient failure
 * here (e.g. API cold start) never blocks the rest of app bootstrap. Chat
 * sending has its own defensive CHAT_DEVICE_UNKNOWN retry (see
 * sendMessage.ts) in case this genuinely didn't complete.
 */
export async function bootstrapChatKeys(): Promise<void> {
  if (typeof window === "undefined") return;
  try {
    await replenishChatKeysIfLow();
  } catch {
    // Swallowed deliberately -- see docstring above. Never log the error
    // object here either, out of an abundance of caution: some Olm/WASM
    // exceptions can include fragments of key material in their message.
  }
}
