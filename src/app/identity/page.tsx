"use client";

import { FormEvent, useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ImagePlus } from "lucide-react";
import { AppShell } from "@/components/layout/Shells";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Skeleton } from "@/components/ui/EmptyState";
import { useToast } from "@/components/ui/Toast";
import {
  fetchIdentity,
  submitIdentity,
} from "@/features/api/services";
import { friendlyUploadError } from "@/lib/formatters";
import { uploadFiles } from "@/lib/uploads";
import { useAuthStore } from "@/stores/authStore";
import type { IdKind } from "@/types";

function PhotoSlot({
  label,
  file,
  onChange,
}: {
  label: string;
  file: File | null;
  onChange: (file: File | null) => void;
}) {
  const [preview, setPreview] = useState<string | null>(null);
  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);
  return (
    <label className="flex cursor-pointer flex-col gap-1.5 text-sm">
      <span className="type-label">{label}</span>
      <span className="relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-md bg-elevated text-ink-muted">
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="" className="h-full w-full object-cover" />
        ) : (
          <span className="flex flex-col items-center gap-1">
            <ImagePlus className="h-6 w-6" />
            <span className="text-xs font-semibold">Add photo</span>
          </span>
        )}
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => onChange(e.target.files?.[0] ?? null)}
        />
      </span>
    </label>
  );
}

export default function IdentityPage() {
  const toast = useToast();
  const qc = useQueryClient();
  const user = useAuthStore((s) => s.user);

  const [idKind, setIdKind] = useState<IdKind>("NATIONAL_ID");
  const [fullNameOnId, setFullNameOnId] = useState("");
  const [front, setFront] = useState<File | null>(null);
  const [back, setBack] = useState<File | null>(null);
  const [selfie, setSelfie] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["identity"],
    queryFn: fetchIdentity,
    enabled: Boolean(user),
  });

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!front || !selfie) {
      toast.push("Upload ID front and selfie", "error");
      return;
    }
    setSaving(true);
    try {
      const files = [front, selfie, ...(back ? [back] : [])];
      const urls = await uploadFiles(files, "IDENTITY");
      await submitIdentity({
        idKind,
        idFrontUrl: urls[0],
        selfieUrl: urls[1],
        idBackUrl: back ? urls[2] : undefined,
        fullNameOnId: fullNameOnId.trim() || undefined,
      });
      toast.push("Verification submitted", "success");
      void qc.invalidateQueries({ queryKey: ["identity"] });
    } catch (err) {
      toast.push(friendlyUploadError(err), "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AppShell>
      <RequireAuth next="/identity">
        <div className="mx-auto max-w-lg">
          <PageHeader
            title="Verify identity"
            description="Get verified to raise your listing cap and sell with more trust."
          />

          {isLoading ? (
            <Skeleton className="h-24 rounded-lg" />
          ) : (
            <div className="rounded-lg border border-border bg-surface p-4 shadow-rest">
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={data?.status ?? "NONE"} />
                <span className="type-meta">
                  {data?.listingCap ?? 3} active listings allowed
                </span>
              </div>
              {data?.status === "APPROVED" ? (
                <p className="mt-3 text-sm text-ink-secondary">
                  You&apos;re verified. You can list more items and buyers see
                  more trust on your profile.
                </p>
              ) : data?.status === "PENDING" ? (
                <p className="mt-3 text-sm text-ink-secondary">
                  Your documents are in review. We&apos;ll notify you when
                  there&apos;s an update.
                </p>
              ) : (
                <p className="mt-3 text-sm text-ink-secondary">
                  Upload a clear photo of your ID and a selfie. Photos are used
                  for verification only — not on your listings.
                </p>
              )}
              {data?.rejectionReason ? (
                <p className="mt-3 rounded-md bg-danger/5 px-3 py-2 text-sm text-danger">
                  {data.rejectionReason}
                </p>
              ) : null}
            </div>
          )}

          {data?.status !== "APPROVED" && data?.status !== "PENDING" ? (
            <form
              onSubmit={onSubmit}
              className="mt-6 space-y-4 rounded-lg border border-border bg-surface p-4 shadow-rest"
            >
              <Select
                label="ID type"
                value={idKind}
                onChange={(e) => setIdKind(e.target.value as IdKind)}
              >
                <option value="NATIONAL_ID">National ID</option>
                <option value="PASSPORT">Passport</option>
                <option value="DRIVERS_LICENSE">Driver’s license</option>
                <option value="VOTERS_CARD">Voter’s card</option>
              </Select>
              <Input
                label="Name on ID (optional)"
                value={fullNameOnId}
                onChange={(e) => setFullNameOnId(e.target.value)}
              />
              <div className="grid grid-cols-2 gap-3">
                <PhotoSlot label="ID front" file={front} onChange={setFront} />
                <PhotoSlot
                  label="ID back (optional)"
                  file={back}
                  onChange={setBack}
                />
              </div>
              <PhotoSlot label="Selfie" file={selfie} onChange={setSelfie} />
              <Button type="submit" loading={saving} className="w-full" size="lg">
                Submit for review
              </Button>
            </form>
          ) : null}
        </div>
      </RequireAuth>
    </AppShell>
  );
}
