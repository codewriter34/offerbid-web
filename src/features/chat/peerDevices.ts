import { fetchPeerChatKeys } from "@/features/api/services";
import {
  getCachedPeerDeviceList,
  setCachedPeerDeviceList,
  invalidatePeerDeviceCache,
  hasSessionWithDevice,
} from "@/lib/signal/crypto";
import type { PeerDeviceBundle } from "@/types";

/**
 * Returns the set of a peer's active chat devices, using the local cache
 * when possible so we don't re-hit GET /chats/keys/:peerUserId (which
 * consumes one one-time prekey per device on the server) on every message
 * send. We only trust the cache when we already hold a live Olm session
 * with every device it lists -- once that's true there's nothing left to
 * fetch a prekey bundle *for*, since further messages just ratchet the
 * existing session forward. If the peer has registered a device we don't
 * know about yet, our cached list won't include it and the server's fan-out
 * validation on POST /chats/:id/messages will 400; callers should catch
 * that, call `invalidatePeerDeviceCache` and retry with `forceRefresh`.
 */
export async function getOrFetchPeerDevices(
  peerUserId: string,
  forceRefresh = false,
): Promise<PeerDeviceBundle[]> {
  if (!forceRefresh) {
    const cached = await getCachedPeerDeviceList(peerUserId);
    if (cached.length > 0) {
      const established = await Promise.all(
        cached.map((d) => hasSessionWithDevice(peerUserId, d.deviceId)),
      );
      if (established.every(Boolean)) {
        // We have live sessions for every cached device but no fresh
        // one-time-prekey bundle for them -- that's fine, a cached device
        // entry only needs to carry enough to *encrypt*, and once a
        // session exists we no longer need oneTimePreKey/signedPreKey at
        // all (Olm ratchets the existing session forward instead).
        return cached.map((d) => ({
          ...d,
          userId: peerUserId,
          signedPreKey: { keyId: 0, publicKey: "", signature: "" },
          oneTimePreKey: null,
        }));
      }
    }
  }

  const bundle = await fetchPeerChatKeys(peerUserId);
  await setCachedPeerDeviceList(
    peerUserId,
    bundle.devices.map((d) => ({
      deviceId: d.deviceId,
      registrationId: d.registrationId,
      identityKey: d.identityKey,
    })),
  );
  return bundle.devices;
}

export { invalidatePeerDeviceCache };
