"use client";

import { useQuery } from "@tanstack/react-query";
import { getOrCreateDeviceId } from "@/lib/signal/deviceId";

export function useMyDeviceId() {
  return useQuery({
    queryKey: ["chat", "my-device-id"],
    queryFn: getOrCreateDeviceId,
    staleTime: Infinity,
    gcTime: Infinity,
  });
}
