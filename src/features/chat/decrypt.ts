import { decryptEnvelope } from "@/lib/signal/crypto";
import type { ChatMessage } from "@/types";

/**
 * Finds the envelope in `message.envelopes` addressed to this device and
 * decrypts it. The server already filters envelopes to only ones addressed
 * to our own devices, so if none matches `myDeviceId` it means this message
 * was never meant to be readable on this device (for example, a message we
 * sent from a different device, or -- in this app's current scope -- our
 * own outbound message, which we render from local plaintext instead; see
 * useSendMessage.ts).
 */
export async function decryptMessage(
  message: ChatMessage,
  myDeviceId: string,
): Promise<ChatMessage> {
  const envelope = message.envelopes.find(
    (e) => e.recipientDeviceId === myDeviceId,
  );
  if (!envelope) {
    return { ...message, plaintext: null, decryptError: true };
  }
  const result = await decryptEnvelope({
    senderUserId: message.senderId,
    senderDeviceId: message.senderDeviceId,
    type: envelope.type,
    ciphertext: envelope.ciphertext,
  });
  return {
    ...message,
    plaintext: result.plaintext,
    decryptError: result.plaintext == null,
  };
}
