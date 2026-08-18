import { io, type Socket } from "socket.io-client";
import { API_CONFIG } from "@/api/endpoints";
import { getAccessToken } from "@/lib/tokenStorage";

let socket: Socket | null = null;

export function getSocket(): Socket | null {
  return socket;
}

export function connectSocket() {
  const token = getAccessToken();
  if (!token) return null;
  if (socket?.connected) return socket;

  socket?.disconnect();
  socket = io(API_CONFIG.SOCKET_URL, {
    auth: { token },
    transports: ["websocket", "polling"],
    autoConnect: true,
  });
  return socket;
}

export function disconnectSocket() {
  socket?.disconnect();
  socket = null;
}

export function subscribeToListing(listingId: string) {
  socket?.emit("subscribeToListing", { listingId });
}

export function unsubscribeFromListing(listingId: string) {
  socket?.emit("unsubscribeFromListing", { listingId });
}
