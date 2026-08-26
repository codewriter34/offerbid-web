"use client";

import { useEffect } from "react";
import { Dialog } from "@/components/ui/Dialog";
import { popConfetti } from "@/lib/confetti";

export function SuccessSheet({
  open,
  onClose,
  title,
  description,
  children,
  celebrate = true,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children?: React.ReactNode;
  celebrate?: boolean;
}) {
  useEffect(() => {
    if (open && celebrate) popConfetti();
  }, [open, celebrate]);

  return (
    <Dialog open={open} onClose={onClose} title={title}>
      {description ? (
        <p className="text-sm leading-relaxed text-ink-secondary">
          {description}
        </p>
      ) : null}
      {children ? <div className="mt-5 space-y-2">{children}</div> : null}
    </Dialog>
  );
}
