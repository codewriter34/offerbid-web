import apiClient from "@/api/client";
import { ENDPOINTS } from "@/api/endpoints";

export type UploadPurpose = "AVATAR" | "LISTING" | "IDENTITY";

interface PresignSlot {
  uploadUrl: string;
  publicUrl: string;
}

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

function contentTypeOf(file: File): "image/jpeg" | "image/png" | "image/webp" {
  if (ALLOWED_TYPES.has(file.type)) {
    return file.type as "image/jpeg" | "image/png" | "image/webp";
  }
  const name = file.name.toLowerCase();
  if (name.endsWith(".png")) return "image/png";
  if (name.endsWith(".webp")) return "image/webp";
  return "image/jpeg";
}

function parseSlots(data: unknown, count: number): PresignSlot[] {
  const raw = (data ?? {}) as Record<string, unknown>;
  const list =
    raw.uploads ??
    raw.files ??
    raw.slots ??
    (Array.isArray(data) ? data : []);
  if (!Array.isArray(list)) return [];
  return list.slice(0, count).map((item) => {
    const rec = (item ?? {}) as Record<string, string>;
    return {
      uploadUrl: rec.uploadUrl ?? rec.url ?? rec.putUrl ?? "",
      publicUrl: rec.publicUrl ?? rec.url ?? "",
    };
  });
}

function uploadsUnavailableError(error: unknown): Error {
  const message =
    error && typeof error === "object"
      ? String(
          (error as { response?: { data?: { message?: string } }; message?: string })
            .response?.data?.message ??
            (error as { message?: string }).message ??
            "",
        )
      : "";
  if (
    /not configured|s3|aws|uploads are not/i.test(message) ||
    (error as { response?: { status?: number } })?.response?.status === 503
  ) {
    return new Error("Uploads are not available yet");
  }
  return error instanceof Error ? error : new Error("Uploads are not available yet");
}

export async function uploadFiles(
  files: File[],
  purpose: UploadPurpose,
): Promise<string[]> {
  if (files.length === 0) return [];

  const payload = {
    purpose,
    files: files.map((file) => ({ contentType: contentTypeOf(file) })),
  };

  let data: unknown;
  try {
    const res = await apiClient.post(ENDPOINTS.UPLOADS.PRESIGN, payload);
    data = res.data;
  } catch (error) {
    throw uploadsUnavailableError(error);
  }

  const slots = parseSlots(data, files.length);
  if (slots.length < files.length || slots.some((s) => !s.uploadUrl || !s.publicUrl)) {
    throw new Error("Uploads are not available yet");
  }

  const urls: string[] = [];
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const contentType = payload.files[i].contentType;
    const res = await fetch(slots[i].uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": contentType },
      body: file,
    });
    if (!res.ok) {
      throw new Error("Uploads are not available yet");
    }
    urls.push(slots[i].publicUrl);
  }
  return urls;
}

export async function uploadFile(
  file: File,
  purpose: UploadPurpose,
): Promise<string> {
  const [url] = await uploadFiles([file], purpose);
  return url;
}
