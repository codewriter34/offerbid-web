"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import imageCompression from "browser-image-compression";
import { ImagePlus, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { AppShell } from "@/components/layout/Shells";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { HubFields } from "@/components/hub/HubFields";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { PageHeader } from "@/components/ui/PageHeader";
import { useToast } from "@/components/ui/Toast";
import {
  createListing,
  fetchIdentity,
  fetchMyListings,
} from "@/features/api/services";
import { useAuthStore } from "@/stores/authStore";
import { useHubStore } from "@/stores/hubStore";
import {
  MAX_LISTING_IMAGES,
  MAX_ACTIVE_LISTINGS_UNVERIFIED,
  MAX_ACTIVE_LISTINGS_VERIFIED,
} from "@/lib/env";
import { friendlyUploadError } from "@/lib/formatters";
import { uploadFiles } from "@/lib/uploads";
import {
  assertRealPlace,
  currencyForCountry,
  type HubDraft,
} from "@/lib/hubs";
import {
  isValidListingDescription,
  isValidListingTitle,
  isValidMinBid,
  isValidPrice,
} from "@/lib/validators";

async function compressImage(file: File) {
  return imageCompression(file, {
    maxSizeMB: 0.8,
    maxWidthOrHeight: 1600,
    useWebWorker: true,
  });
}

export default function SellPage() {
  const router = useRouter();
  const toast = useToast();
  const user = useAuthStore((s) => s.user);
  const categories = useHubStore((s) => s.categories);
  const countries = useHubStore((s) => s.countries);
  const otherLabel = useHubStore((s) => s.otherLabel);
  const selectedCity = useHubStore((s) => s.selectedCity);
  const selectedLocation = useHubStore((s) => s.selectedLocation);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [askingPrice, setAskingPrice] = useState("");
  const [minBidPrice, setMinBidPrice] = useState("");
  const [showMinBid, setShowMinBid] = useState(false);
  const [category, setCategory] = useState("");
  const [hub, setHub] = useState<HubDraft>({
    country: user?.country ?? countries[0]?.country ?? "CAMEROON",
    city: selectedCity ?? user?.city ?? "Buea",
    customCity: "",
    location: selectedLocation ?? user?.location ?? "",
    customLocation: "",
  });
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const listingsQuery = useQuery({
    queryKey: ["my-listings"],
    queryFn: fetchMyListings,
    enabled: Boolean(user),
  });
  const identityQuery = useQuery({
    queryKey: ["identity"],
    queryFn: fetchIdentity,
    enabled: Boolean(user),
  });

  const listingCap =
    identityQuery.data?.listingCap ??
    (user?.isVerified
      ? MAX_ACTIVE_LISTINGS_VERIFIED
      : MAX_ACTIVE_LISTINGS_UNVERIFIED);
  const activeCount =
    listingsQuery.data?.filter(
      (listing) => String(listing.status).toUpperCase() === "ACTIVE",
    ).length ?? 0;
  const atLimit = activeCount >= listingCap;
  const currency = currencyForCountry(countries, hub.country);

  const categoryOptions = useMemo(
    () =>
      categories.length
        ? categories
        : ["Tech", "Phones", "Furniture", "Fashion", "Books", "Other"],
    [categories],
  );

  function onFiles(selected: FileList | null) {
    if (!selected) return;
    const next = [...files, ...Array.from(selected)].slice(0, MAX_LISTING_IMAGES);
    previews.forEach((url) => URL.revokeObjectURL(url));
    setFiles(next);
    setPreviews(next.map((f) => URL.createObjectURL(f)));
    setErrors((prev) => ({ ...prev, images: "" }));
  }

  function removeFile(index: number) {
    const next = files.filter((_, i) => i !== index);
    URL.revokeObjectURL(previews[index]);
    setFiles(next);
    setPreviews(next.map((f) => URL.createObjectURL(f)));
  }

  function validate() {
    const next: Record<string, string> = {};
    const titleErr = isValidListingTitle(title);
    if (titleErr) next.title = titleErr;
    const descErr = isValidListingDescription(description);
    if (descErr) next.description = descErr;
    if (!category) next.category = "Select a category";
    const priceErr = isValidPrice(Number(askingPrice));
    if (priceErr) next.askingPrice = priceErr;
    if (minBidPrice) {
      const minErr = isValidMinBid(Number(minBidPrice), Number(askingPrice));
      if (minErr) next.minBidPrice = minErr;
    }
    const city = hub.city === otherLabel ? hub.customCity : hub.city;
    const location =
      hub.location === otherLabel ? hub.customLocation : hub.location;
    const placeErr = assertRealPlace(city, location, otherLabel);
    if (placeErr) next.location = placeErr;
    if (files.length === 0) next.images = "Add at least one photo";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!user) return;
    if (atLimit) {
      toast.push(
        `You can have up to ${listingCap} active listings. Verify identity to raise the cap.`,
        "error",
      );
      return;
    }
    if (!validate()) return;

    const location =
      hub.location === otherLabel ? hub.customLocation.trim() : hub.location;

    setSaving(true);
    try {
      const compressed = await Promise.all(files.map(compressImage));
      const urls = await uploadFiles(compressed, "LISTING");
      const listing = await createListing({
        title: title.trim(),
        description: description.trim(),
        askingPrice: Number(askingPrice),
        ...(minBidPrice.trim()
          ? { minBidPrice: Number(minBidPrice) }
          : {}),
        currency,
        category,
        location,
        images: urls,
      });
      toast.push("Listing published", "success");
      router.push(`/listings/${listing.id}`);
    } catch (err) {
      toast.push(friendlyUploadError(err), "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AppShell>
      <RequireAuth next="/sell">
        <div className="mx-auto max-w-2xl pb-dock lg:pb-0">
          <PageHeader
            title="Sell an item"
            description="Photos, a price, and a pickup spot. Buyers nearby can offer."
          />
          <p className="mb-6 type-meta">
            {activeCount}/{listingCap} active listings
            {listingCap < MAX_ACTIVE_LISTINGS_VERIFIED ? (
              <>
                {" "}
                ·{" "}
                <Link href="/identity" className="font-semibold text-primary">
                  Verify ID
                </Link>{" "}
                to list more
              </>
            ) : null}
          </p>

          {atLimit ? (
            <div className="mb-6 rounded-md bg-sold/10 px-4 py-3 text-sm text-ink-secondary">
              Listing limit reached.{" "}
              <Link href="/identity" className="font-semibold text-primary">
                Verify your identity
              </Link>{" "}
              to raise the cap, or close an existing listing.
            </div>
          ) : null}

          <form onSubmit={onSubmit} className="space-y-6">
            <div>
              <p className="type-label mb-2">
                Photos (up to {MAX_LISTING_IMAGES})
              </p>
              <div className="grid grid-cols-4 gap-2">
                {previews.map((src, index) => (
                  <div
                    key={`${src}-${index}`}
                    className="relative aspect-square overflow-hidden rounded-md bg-elevated"
                  >
                    <Image
                      src={src}
                      alt=""
                      fill
                      className="object-cover"
                      unoptimized
                    />
                    <button
                      type="button"
                      aria-label="Remove photo"
                      onClick={() => removeFile(index)}
                      className="absolute right-1 top-1 inline-flex h-11 w-11 items-center justify-center rounded-md bg-ink/80 text-white"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                {files.length < MAX_LISTING_IMAGES ? (
                  <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-md border border-dashed border-border bg-elevated text-ink-muted hover:border-primary/40 hover:text-ink">
                    <ImagePlus className="h-6 w-6" />
                    <span className="text-xs font-semibold">Add</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      multiple
                      className="hidden"
                      onChange={(e) => onFiles(e.target.files)}
                    />
                  </label>
                ) : null}
              </div>
              {errors.images ? (
                <p className="mt-1 text-xs text-danger">{errors.images}</p>
              ) : (
                <p className="mt-1 type-meta">
                  First photo is the cover. Up to {MAX_LISTING_IMAGES}.
                </p>
              )}
            </div>

            <Input
              label="Title"
              required
              value={title}
              error={errors.title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="iPhone 13, 128GB, Molyko pickup"
            />
            <Input
              label="Asking price"
              type="number"
              min={1}
              required
              value={askingPrice}
              error={errors.askingPrice}
              onChange={(e) => setAskingPrice(e.target.value)}
              placeholder="175000"
              leading={currency}
            />

            <div className="space-y-3">
              <p className="type-label">Pickup spot</p>
              <HubFields draft={hub} onChange={setHub} showCountry />
              {errors.location ? (
                <p className="text-xs text-danger">{errors.location}</p>
              ) : (
                <p className="type-meta">
                  Meetup can differ from your profile hub.
                </p>
              )}
            </div>

            <Select
              label="Category"
              value={category}
              error={errors.category}
              onChange={(e) => setCategory(e.target.value)}
              required
            >
              <option value="">Select category</option>
              {categoryOptions.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
            <label className="flex flex-col gap-1.5 text-sm">
              <span className="type-label">Description</span>
              <textarea
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                placeholder="Condition, what’s included, where to meet."
                className="field-control h-auto py-2"
              />
              {errors.description ? (
                <span className="text-xs text-danger">{errors.description}</span>
              ) : null}
            </label>
            {showMinBid ? (
              <Input
                label="Minimum offer (optional)"
                type="number"
                min={1}
                value={minBidPrice}
                error={errors.minBidPrice}
                helper="Buyers must offer at least this amount."
                onChange={(e) => setMinBidPrice(e.target.value)}
              />
            ) : (
              <button
                type="button"
                className="min-h-11 text-left text-sm font-semibold text-ink-muted hover:text-ink"
                onClick={() => setShowMinBid(true)}
              >
                Set a minimum offer
              </button>
            )}

            <div className="safe-sticky-cta fixed inset-x-0 z-30 border-t border-border bg-surface/95 p-3 lg:static lg:bottom-auto lg:border-0 lg:bg-transparent lg:p-0">
              <Button
                type="submit"
                loading={saving}
                disabled={atLimit}
                className="w-full"
                size="lg"
              >
                Publish listing
              </Button>
            </div>
          </form>
        </div>
      </RequireAuth>
    </AppShell>
  );
}
