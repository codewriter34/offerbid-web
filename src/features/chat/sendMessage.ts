import axios from "axios";
import { sendChatMessage } from "@/features/api/services";
import { getPeerDeviceEnvelope } from "@/lib/signal/crypto";
import { getOrFetchPeerDevices, invalidatePeerDeviceCache } from "./peerDevices";
import { ensureChatKeysUploaded } from "./keysBootstrap";
import { getErrorMessage } from "@/lib/formatters";
import type { MessageEnvelope, SendMessageResult } from "@/types";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function errorCode(err: unknown): string | undefined {
  if (axios.isAxiosError(err)) {
    return (err.response?.data as { code?: string } | undefined)?.code;
  }
  return undefined;
}

function isDeviceFanoutMismatch(err: unknown): boolean {
  if (!axios.isAxiosError(err)) return false;
  const message = (err.response?.data as { message?: string } | undefined)
    ?.message;
  return typeof message === "string" && /every device/i.test(message);
}

/**
 * Encrypts `plaintext` for every active device of the conversation's peer
 * and posts the resulting envelopes. Own-other-device fan-out is
 * deliberately out of scope for this pass: GET /chats/keys/:userId 400s
 * with "Cannot fetch your own prekey bundle this way" when called for our
 * own user id, so there is no supported way to discover our own other
 * devices' prekey bundles via this API. If multi-device sync becomes a
 * requirement, that needs a new backend endpoint first.
 */
export async function sendEncryptedMessage(params: {
  chatId: string;
  peerUserId: string;
  myDeviceId: string;
  plaintext: string;
}): Promise<SendMessageResult> {
  const { chatId, peerUserId, myDeviceId, plaintext } = params;

  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const devices = await getOrFetchPeerDevices(peerUserId, attempt > 1);
      if (devices.length === 0) {
        throw new Error("They have not enabled chat yet.");
      }

      const envelopes: MessageEnvelope[] = [];
      for (const device of devices) {
        envelopes.push(
          await getPeerDeviceEnvelope(peerUserId, device, plaintext),
        );
      }

      try {
        return await sendChatMessage(chatId, {
          senderDeviceId: myDeviceId,
          envelopes,
        });
      } catch (sendErr) {
        if (errorCode(sendErr) === "CHAT_COOLDOWN") {
          // Sent faster than the server's ~400ms cooldown. Back off briefly
          // and retry once, silently, rather than surfacing an error for
          // what's effectively just double-tapping "send".
          await sleep(450);
          return await sendChatMessage(chatId, {
            senderDeviceId: myDeviceId,
            envelopes,
          });
        }
        throw sendErr;
      }
    } catch (err) {
      const code = errorCode(err);

      if (code === "CHAT_DEVICE_UNKNOWN" && attempt === 1) {
        await ensureChatKeysUploaded();
        continue;
      }

      if (code === "CHAT_KEYS_MISSING") {
        throw new Error("They have not enabled chat yet.");
      }

      if (isDeviceFanoutMismatch(err) && attempt === 1) {
        // Our cached peer device list is stale (they registered a new
        // device since we last fetched their bundle). Drop the cache and
        // retry once with a fresh GET /chats/keys/:peerUserId.
        await invalidatePeerDeviceCache(peerUserId);
        continue;
      }

      if (err instanceof Error && !axios.isAxiosError(err)) {
        // Already a friendly, hand-thrown Error (e.g. "They have not
        // enabled chat yet.") -- don't re-wrap it.
        throw err;
      }

      throw new Error(getErrorMessage(err));
    }
  }

  throw new Error("Could not send message. Please try again.");
}
