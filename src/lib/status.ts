import type { BidStatus, ListingStatus, NotificationType } from "@/types";

export type StatusTone =
  | "neutral"
  | "primary"
  | "success"
  | "warning"
  | "danger"
  | "pending"
  | "countered"
  | "accepted"
  | "rejected"
  | "expired"
  | "sold"
  | "verified";

export type StatusKind =
  | BidStatus
  | ListingStatus
  | "PENDING"
  | "COUNTERED"
  | "ACCEPTED"
  | "REJECTED"
  | "EXPIRED"
  | "ACTIVE"
  | "SOLD"
  | "CLOSED"
  | "VERIFIED"
  | "UNVERIFIED"
  | "NONE"
  | "APPROVED"
  | string;

const BID_LABELS: Record<string, string> = {
  PENDING: "Pending offer",
  COUNTERED: "Countered",
  ACCEPTED: "Accepted",
  REJECTED: "Rejected",
  EXPIRED: "Expired",
};

const LISTING_LABELS: Record<string, string> = {
  ACTIVE: "Active",
  SOLD: "Sold",
  CLOSED: "Closed",
};

const IDENTITY_LABELS: Record<string, string> = {
  NONE: "Not submitted",
  PENDING: "In review",
  APPROVED: "Verified",
  REJECTED: "Needs update",
  VERIFIED: "Verified",
  UNVERIFIED: "Unverified",
};

export function statusLabel(status: StatusKind): string {
  const key = String(status ?? "").toUpperCase();
  return (
    BID_LABELS[key] ??
    LISTING_LABELS[key] ??
    IDENTITY_LABELS[key] ??
    (key ? key.charAt(0) + key.slice(1).toLowerCase() : "Unknown")
  );
}

export function statusTone(status: StatusKind): StatusTone {
  const key = String(status ?? "").toUpperCase();
  if (key === "COUNTERED") return "countered";
  if (key === "PENDING") return "pending";
  if (key === "ACCEPTED" || key === "APPROVED" || key === "ACTIVE") {
    return "accepted";
  }
  if (key === "REJECTED") return "rejected";
  if (key === "EXPIRED" || key === "CLOSED" || key === "NONE") return "expired";
  if (key === "SOLD") return "sold";
  if (key === "VERIFIED") return "verified";
  return "neutral";
}

export function notificationCopy(type: NotificationType): {
  title: string;
} {
  switch (type) {
    case "new_bid":
      return { title: "New offer on your listing" };
    case "bid_accepted":
      return { title: "Your offer was accepted" };
    case "bid_rejected":
      return { title: "Your offer was declined" };
    case "bid_countered":
      return { title: "Seller sent a counter" };
    case "bid_expiring":
      return { title: "Offer expiring soon" };
    case "listing_contact":
      return { title: "WhatsApp contact unlocked" };
    default:
      return { title: "Marketplace update" };
  }
}
