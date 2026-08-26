"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import { useHubStore } from "@/stores/hubStore";
import { restoreSession } from "@/features/auth/authService";
import { fetchHubs } from "@/features/api/services";
import { connectSocket, disconnectSocket } from "@/lib/socket";

function AuthBootstrap({ children }: { children: React.ReactNode }) {
  const setUser = useAuthStore((s) => s.setUser);
  const setLoading = useAuthStore((s) => s.setLoading);
  const clear = useAuthStore((s) => s.clear);
  const user = useAuthStore((s) => s.user);
  const setCatalog = useHubStore((s) => s.setCatalog);
  const setSelection = useHubStore((s) => s.setSelection);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const [session, hubs] = await Promise.all([
          restoreSession(),
          fetchHubs().catch(() => null),
        ]);
        if (!mounted) return;
        setUser(session);
        if (hubs) {
          setCatalog({
            hubs: hubs.hubs,
            countries: hubs.countries,
            categories: hubs.categories,
            cities: hubs.cities,
            allowOther: hubs.allowOther,
            otherLabel: hubs.otherLabel,
          });
        }
        if (session?.city) {
          setSelection(session.city, session.location);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    const onClear = () => {
      clear();
      disconnectSocket();
    };
    window.addEventListener("offerbid:session-cleared", onClear);
    return () => {
      mounted = false;
      window.removeEventListener("offerbid:session-cleared", onClear);
    };
  }, [clear, setCatalog, setLoading, setSelection, setUser]);

  useEffect(() => {
    if (user) connectSocket();
    else disconnectSocket();
  }, [user]);

  return <>{children}</>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            retry: 3,
            retryDelay: (attempt) => Math.min(1500 * 2 ** attempt, 8000),
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={client}>
      <AuthBootstrap>{children}</AuthBootstrap>
    </QueryClientProvider>
  );
}
