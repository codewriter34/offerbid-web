"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { cn } from "@/lib/cn";

type Toast = { id: string; message: string; tone?: "success" | "error" | "info" };

const ToastContext = createContext<{
  push: (message: string, tone?: Toast["tone"]) => void;
} | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const push = useCallback((message: string, tone: Toast["tone"] = "info") => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { id, message, tone }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const value = useMemo(() => ({ push }), [push]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none safe-toast fixed inset-x-4 z-[100] flex flex-col gap-2 lg:inset-x-auto lg:bottom-6 lg:right-4 lg:w-full lg:max-w-sm">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={cn(
              "pointer-events-auto rounded-md border px-4 py-3 text-sm shadow-rest backdrop-blur",
              toast.tone === "success" &&
                "border-success/20 bg-surface text-success",
              toast.tone === "error" && "border-danger/20 bg-surface text-danger",
              toast.tone === "info" && "border-border bg-surface text-ink",
            )}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
