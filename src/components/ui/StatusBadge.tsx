import {
  Check,
  Clock,
  ShieldCheck,
  TimerOff,
  Ban,
  ArrowLeftRight,
  Tag,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { statusLabel, statusTone, type StatusKind } from "@/lib/status";

const icons = {
  pending: Clock,
  countered: ArrowLeftRight,
  accepted: Check,
  rejected: Ban,
  expired: TimerOff,
  sold: Tag,
  verified: ShieldCheck,
  success: Check,
  warning: Clock,
  danger: Ban,
  primary: ShieldCheck,
  neutral: Tag,
};

export function StatusBadge({
  status,
  className,
}: {
  status: StatusKind;
  className?: string;
}) {
  const tone = statusTone(status);
  const Icon = icons[tone] ?? Tag;
  return (
    <Badge tone={tone} className={className}>
      <Icon className="h-3 w-3" aria-hidden />
      {statusLabel(status)}
    </Badge>
  );
}
