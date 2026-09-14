import { io, type Socket } from "socket.io-client";
import { API_CONFIG } from "@/api/endpoints";
import { getAccessToken } from "@/lib/tokenStorage";

let socket: Socket | null = null;

/** Socket.IO wants http(s); it upgrades to ws(s) itself. */
function socketHttpUrl(url: string) {
  return url.replace(/^wss:/i, "https:").replace(/^ws:/i, "http:");
}

export function getSocket(): Socket | null {
  return socket;
}

export function connectSocket() {
  const token = getAccessToken();
  if (!token) return null;

  if (socket) {
    socket.auth = { token };
    if (socket.connected || socket.active) return socket;
    socket.disconnect();
    socket = null;
  }

  // Polling first: Render sits behind Cloudflare (HTTP/3). Firefox often fails
  // a websocket-first handshake, then logs "can't establish a connection".
  socket = io(socketHttpUrl(API_CONFIG.SOCKET_URL), {
    auth: { token },
    transports: ["polling", "websocket"],
    upgrade: true,
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 8,
    reconnectionDelay: 1000,
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
