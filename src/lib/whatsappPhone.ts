const KEY = "offerbid:whatsappPhone";

export function getLocalWhatsAppPhone(): string | null {
  if (typeof window === "undefined") return null;
  const value = window.localStorage.getItem(KEY);
  return value?.trim() || null;
}

export function setLocalWhatsAppPhone(phone: string) {
  if (typeof window === "undefined") return;
  const trimmed = phone.trim();
  if (trimmed) window.localStorage.setItem(KEY, trimmed);
  else window.localStorage.removeItem(KEY);
}

export function effectiveWhatsAppPhone(
  accountPhone: string | null | undefined,
): string | null {
  return accountPhone?.trim() || getLocalWhatsAppPhone();
}
