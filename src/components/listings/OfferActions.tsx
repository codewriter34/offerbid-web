"use client";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export function OfferActions({
  counterValue,
  onCounterChange,
  onAccept,
  onReject,
  onCounter,
  acceptLabel = "Accept",
  rejectLabel = "Reject",
  counterPending,
}: {
  counterValue: string;
  onCounterChange: (value: string) => void;
  onAccept: () => void;
  onReject: () => void;
  onCounter: () => void;
  acceptLabel?: string;
  rejectLabel?: string;
  counterPending?: boolean;
}) {
  return (
    <div className="mt-3 space-y-2">
      <div className="flex flex-wrap gap-2">
        <Button onClick={onAccept}>{acceptLabel}</Button>
        <Button variant="outline" onClick={onReject}>
          {rejectLabel}
        </Button>
      </div>
      {counterPending ? (
        <div className="flex items-end gap-2">
          <div className="min-w-0 flex-1">
            <Input
              type="number"
              placeholder="Counter amount"
              value={counterValue}
              onChange={(e) => onCounterChange(e.target.value)}
            />
          </div>
          <Button
            variant="secondary"
            disabled={!counterValue}
            onClick={onCounter}
          >
            Counter
          </Button>
        </div>
      ) : null}
    </div>
  );
}
