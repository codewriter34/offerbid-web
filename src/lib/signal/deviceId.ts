import { getMeta, setMeta } from "./store";

const DEVICE_ID_KEY = "deviceId";
const REGISTRATION_ID_KEY = "registrationId";

/**
 * Stable per-browser-profile device id (UUID), persisted forever in
 * IndexedDB. This is the `deviceId` the chat API expects on every key
 * upload and every sent message (`senderDeviceId`). It is generated once
 * and never rotated -- rotating it would orphan every existing Olm session
 * this browser profile has with its peers.
 */
export async function getOrCreateDeviceId(): Promise<string> {
  const existing = await getMeta(DEVICE_ID_KEY);
  if (existing) return existing;
  const id = crypto.randomUUID();
  await setMeta(DEVICE_ID_KEY, id);
  return id;
}

/**
 * The API's POST /chats/keys requires a `registrationId` (int). Signal's
 * own protocol uses this as a 14-bit device identifier mostly to detect
 * reinstalls; we don't have a reinstall-detection requirement here, so we
 * just need a stable positive integer generated once per device and never
 * changed.
 */
export async function getOrCreateRegistrationId(): Promise<number> {
  const existing = await getMeta(REGISTRATION_ID_KEY);
  if (existing) return Number(existing);
  const id = 1 + Math.floor(Math.random() * 16380);
  await setMeta(REGISTRATION_ID_KEY, String(id));
  return id;
}
