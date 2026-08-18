export function formatPrice(
  amount: number,
  currency: string = "XAF",
): string {
  if (currency === "XAF") {
    return `FCFA ${Math.round(amount).toLocaleString()}`;
  }
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString()}`;
  }
}

export function formatRelativeTime(iso: string | null | undefined): string {
  if (!iso) return "";
  const date = new Date(iso);
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}

export function formatCountdown(expiresAt: string | null | undefined): {
  label: string;
  urgent: boolean;
  expired: boolean;
} {
  if (!expiresAt) return { label: "", urgent: false, expired: false };
  const ms = new Date(expiresAt).getTime() - Date.now();
  if (ms <= 0) return { label: "Expired", urgent: true, expired: true };
  const totalMins = Math.floor(ms / 60000);
  const hours = Math.floor(totalMins / 60);
  const mins = totalMins % 60;
  const label =
    hours > 0 ? `${hours}h ${mins}m left` : `${Math.max(mins, 1)}m left`;
  return { label, urgent: ms < 60 * 60 * 1000, expired: false };
}

export function openWhatsApp(url: string) {
  if (!url) return;
  window.open(url, "_blank", "noopener,noreferrer");
}

export function getErrorMessage(error: unknown, fallback = "Something went wrong") {
  if (typeof error === "string") return error;
  if (error && typeof error === "object") {
    const ax = error as {
      response?: { data?: { message?: string | string[] | Record<string, unknown>; error?: string; code?: string } };
      message?: string;
    };
    const raw = ax.response?.data?.message ?? ax.response?.data?.error ?? ax.message;
    if (raw && typeof raw === "object" && !Array.isArray(raw)) {
      const nested = raw as { message?: string; code?: string };
      if (typeof nested.message === "string" && nested.message.length) {
        return nested.message;
      }
    }
    if (Array.isArray(raw)) return raw.join(", ");
    if (typeof raw === "string" && raw.length) return raw;
  }
  return fallback;
}

export function getAuthErrorCode(error: unknown): string | null {
  if (!error || typeof error !== "object") return null;
  const ax = error as {
    response?: { data?: { message?: unknown; code?: string } };
  };
  const top = ax.response?.data?.code;
  if (typeof top === "string") return top;
  const msg = ax.response?.data?.message;
  if (msg && typeof msg === "object" && !Array.isArray(msg)) {
    const code = (msg as { code?: string }).code;
    if (typeof code === "string") return code;
  }
  return null;
}

export function friendlyUploadError(error: unknown) {
  const message = getErrorMessage(error);
  if (/not configured|s3|aws|uploads are not/i.test(message)) {
    return "Uploads are not available yet";
  }
  return message;
}

export function formatMemberSince(iso: string | null | undefined) {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString(undefined, { month: "short", year: "numeric" });
}
