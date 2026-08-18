import type {
  AppNotification,
  Bid,
  BidStatus,
  CountryHub,
  Hub,
  HubsResponse,
  Identity,
  IdentityStatus,
  Listing,
  ListingImage,
  ListingsPage,
  ListingStatus,
  NotificationType,
  User,
} from "@/types";
import {
  extractList,
  extractWhatsAppUrl,
  listingImageUrl,
  pickNumber,
  pickString,
} from "./normalize";

type Raw = Record<string, unknown>;

function asRecord(value: unknown): Raw {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Raw)
    : {};
}

export function mapUser(rawInput: unknown): User {
  const raw = asRecord(rawInput);
  const city = pickString(raw.city);
  const address = pickString(raw.address);
  const location = pickString(raw.location);
  return {
    id: String(raw.id ?? ""),
    email: pickString(raw.email),
    fullName:
      pickString(raw.fullName, raw.display_name, raw.displayName, raw.name) ??
      "User",
    phone: pickString(raw.phone),
    countryCode: pickString(raw.countryCode, raw.country_code),
    country: pickString(raw.country),
    primaryIntent: pickString(raw.primaryIntent, raw.primary_intent),
    city,
    address,
    location,
    avatarUrl: pickString(raw.avatarUrl, raw.avatar, raw.avatar_url, raw.url),
    profileComplete: Boolean(
      raw.profileComplete ??
        raw.profile_complete ??
        raw.isProfileComplete ??
        raw.is_profile_complete ??
        (city && address && location),
    ),
    isVerified: Boolean(raw.isVerified ?? raw.is_verified),
    googleId: pickString(raw.googleId, raw.google_id),
    createdAt: pickString(raw.createdAt, raw.created_at),
  };
}

function mapListingStatus(value: unknown): ListingStatus | string {
  const status = String(value ?? "ACTIVE").toUpperCase();
  if (status === "WITHDRAWN") return "CLOSED";
  return status;
}

function mapImages(raw: unknown): ListingImage[] {
  if (!Array.isArray(raw)) return [];
  const images: ListingImage[] = [];
  raw.forEach((item, index) => {
    if (typeof item === "string") {
      images.push({ id: String(index), url: item });
      return;
    }
    const rec = asRecord(item);
    const url = pickString(
      rec.url,
      rec.publicUrl,
      rec.cloudinary_url,
      rec.secure_url,
      rec.src,
      rec.uri,
    );
    if (url) {
      images.push({ id: pickString(rec.id) ?? String(index), url });
    }
  });
  return images;
}

function mapListingSeller(rawInput: unknown): Listing["seller"] {
  const raw = asRecord(rawInput);
  if (!raw.id && !raw.fullName && !raw.name && !raw.avatarUrl) {
    return null;
  }
  return {
    id: pickString(raw.id),
    fullName:
      pickString(raw.fullName, raw.display_name, raw.displayName, raw.name) ??
      "Seller",
    avatarUrl: pickString(raw.avatarUrl, raw.avatar, raw.avatar_url, raw.url),
    createdAt: pickString(
      raw.createdAt,
      raw.created_at,
      raw.joinedAt,
      raw.joined_at,
      raw.memberSince,
    ),
  };
}

export function mapListing(rawInput: unknown): Listing {
  const raw = asRecord(rawInput);
  const seller = mapListingSeller(raw.seller ?? raw.user);
  const sellerRec = asRecord(raw.seller ?? raw.user);
  return {
    id: String(raw.id ?? ""),
    sellerId: String(
      raw.sellerId ?? raw.seller_id ?? raw.userId ?? seller?.id ?? "",
    ),
    seller,
    category: String(raw.category ?? "Electronics"),
    title: pickString(raw.title) ?? "",
    description: pickString(raw.description) ?? "",
    askingPrice: pickNumber(raw.askingPrice, raw.starting_price, raw.price) ?? 0,
    minBidPrice: pickNumber(raw.minBidPrice, raw.min_bid, raw.minBid) ?? 0,
    currency: pickString(raw.currency) ?? "XAF",
    status: mapListingStatus(raw.status),
    location: pickString(raw.location, raw.neighborhood),
    city: pickString(raw.city, sellerRec.city),
    images: mapImages(raw.images ?? raw.imageUrls ?? raw.photos ?? raw.media),
    bidCount: pickNumber(raw.bidCount, raw.bid_count, asRecord(raw._count).bids),
    highestBidAmount: pickNumber(
      raw.highestBidAmount,
      raw.highestActiveBid,
      asRecord(raw.highestBid).offerAmount,
      asRecord(raw.highestBid).amount,
      asRecord(raw.highestActiveBid).offerAmount,
    ),
    createdAt:
      pickString(raw.createdAt, raw.created_at) ?? new Date().toISOString(),
  };
}

function mapBidStatus(value: unknown): BidStatus | string {
  return String(value ?? "PENDING").toUpperCase();
}

export function mapBid(rawInput: unknown, listingTitle?: string): Bid {
  const raw = asRecord(rawInput);
  const listing = asRecord(raw.listing);
  return {
    id: String(raw.id ?? ""),
    listingId: String(raw.listingId ?? raw.listing_id ?? listing.id ?? ""),
    listingTitle:
      listingTitle ?? pickString(raw.listingTitle, listing.title) ?? undefined,
    listingImageUrl:
      listingImageUrl(listing) ??
      listingImageUrl(raw) ??
      pickString(raw.listingImageUrl, listing.imageUrl, listing.image),
    listingPlace:
      pickString(raw.listingPlace, listing.location, raw.listingLocation) ??
      null,
    listingCategory: pickString(listing.category, raw.listingCategory),
    minBidPrice: pickNumber(listing.minBidPrice, listing.min_bid, listing.minBid),
    askingPrice: pickNumber(
      listing.askingPrice,
      listing.starting_price,
      listing.price,
    ),
    currency: pickString(listing.currency, raw.currency) ?? "XAF",
    buyerId: String(raw.buyerId ?? raw.buyer_id ?? ""),
    amount: pickNumber(raw.offerAmount, raw.amount, raw.counterAmount) ?? 0,
    status: mapBidStatus(raw.status),
    parentBidId: pickString(raw.parentBidId, raw.parent_bid_id),
    counterAmount: pickNumber(raw.counterAmount, raw.counter_amount),
    expiresAt: pickString(raw.expiresAt, raw.expires_at),
    createdAt:
      pickString(raw.createdAt, raw.created_at) ?? new Date().toISOString(),
    whatsappUrl: extractWhatsAppUrl(raw),
  };
}

const NOTIFICATION_TYPE_MAP: Record<string, NotificationType> = {
  new_bid: "new_bid",
  bid_placed: "new_bid",
  BID_PLACED: "new_bid",
  bid_accepted: "bid_accepted",
  BID_ACCEPTED: "bid_accepted",
  bid_rejected: "bid_rejected",
  BID_REJECTED: "bid_rejected",
  bid_countered: "bid_countered",
  BID_COUNTERED: "bid_countered",
  bid_expiring: "bid_expiring",
  BID_EXPIRING: "bid_expiring",
  BID_EXPIRED: "bid_expiring",
  bid_expired: "bid_expiring",
  LISTING_PUBLISHED: "listing_contact",
  listing_published: "listing_contact",
  DAILY_DIGEST: "unknown",
  MORNING_BROWSE: "unknown",
  listing_contact: "listing_contact",
  LISTING_CONTACT: "listing_contact",
};

export function mapNotification(rawInput: unknown): AppNotification {
  const raw = asRecord(rawInput);
  const typeKey = String(raw.type ?? raw.kind ?? "");
  return {
    id: String(raw.id ?? ""),
    userId: pickString(raw.userId, raw.user_id),
    type: NOTIFICATION_TYPE_MAP[typeKey] ?? "unknown",
    payload: asRecord(raw.payload ?? raw.data),
    read: Boolean(raw.read ?? raw.isRead ?? raw.is_read),
    createdAt:
      pickString(raw.createdAt, raw.created_at) ?? new Date().toISOString(),
    title: pickString(raw.title),
    message: pickString(raw.message, raw.body),
  };
}

function identityFileUrl(files: unknown, type: string): string | null {
  if (!Array.isArray(files)) return null;
  for (const item of files) {
    const rec = asRecord(item);
    if (String(rec.type).toUpperCase() === type) {
      return pickString(rec.url);
    }
  }
  return null;
}

export function mapIdentity(rawInput: unknown): Identity {
  const raw = asRecord(rawInput);
  const files = raw.files;
  let status = String(raw.status ?? "NONE").toUpperCase();
  if (status === "UNSUBMITTED") status = "NONE";
  const normalized = status as IdentityStatus;
  return {
    status: ["NONE", "PENDING", "APPROVED", "REJECTED"].includes(normalized)
      ? normalized
      : "NONE",
    idKind: (raw.idKind ?? raw.id_kind ?? null) as Identity["idKind"],
    idFrontUrl:
      pickString(raw.idFrontUrl, raw.id_front_url) ??
      identityFileUrl(files, "ID_FRONT"),
    idBackUrl:
      pickString(raw.idBackUrl, raw.id_back_url) ??
      identityFileUrl(files, "ID_BACK"),
    selfieUrl:
      pickString(raw.selfieUrl, raw.selfie_url) ??
      identityFileUrl(files, "SELFIE"),
    rejectionReason: pickString(raw.rejectionReason, raw.rejection_reason),
    listingCap:
      pickNumber(
        raw.listingCap,
        raw.listing_cap,
        raw.activeListingLimit,
        raw.active_listing_limit,
      ) ?? (normalized === "APPROVED" ? 10 : 3),
  };
}

function mapStringList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (item): item is string => typeof item === "string" && item.length > 0,
  );
}

export function mapHubs(rawInput: unknown): HubsResponse {
  const raw = asRecord(rawInput);
  const categories = mapStringList(raw.categories);
  const allowOther = Boolean(raw.allowOther);
  const otherLabel = pickString(raw.otherLabel) ?? "Other";
  const hubs: Hub[] = [];
  const countries: CountryHub[] = [];
  const hubsNode = raw.hubs;

  if (hubsNode && typeof hubsNode === "object" && !Array.isArray(hubsNode)) {
    Object.entries(hubsNode as Record<string, unknown>).forEach(
      ([country, value]) => {
        const rec = asRecord(value);
        const citiesMap = asRecord(rec.cities);
        const cityRecord: Record<string, string[]> = {};
        Object.entries(citiesMap).forEach(([city, neighborhoods]) => {
          const list = mapStringList(neighborhoods);
          cityRecord[city] = list;
          if (list.length === 0) {
            hubs.push({ country, city, neighborhood: "", isActive: true });
            return;
          }
          list.forEach((neighborhood) => {
            hubs.push({ country, city, neighborhood, isActive: true });
          });
        });
        countries.push({
          country,
          currency: pickString(rec.currency) ?? "",
          countryCode: pickString(rec.countryCode, rec.country_code) ?? "",
          cities: cityRecord,
        });
      },
    );
  }

  const cities = [...new Set(hubs.map((h) => h.city).filter(Boolean))];
  return { hubs, countries, categories, cities, allowOther, otherLabel };
}

export function mapListings(data: unknown): Listing[] {
  return extractList(data).map(mapListing);
}

export function mapListingsPage(data: unknown): ListingsPage {
  const raw = asRecord(data);
  const listings = mapListings(data);
  return {
    listings,
    page: pickNumber(raw.page) ?? 1,
    limit: pickNumber(raw.limit) ?? listings.length,
    total: pickNumber(raw.total) ?? listings.length,
  };
}

export function mapBids(data: unknown, listingTitle?: string): Bid[] {
  return extractList(data).map((item) => mapBid(item, listingTitle));
}

export function mapNotifications(data: unknown): AppNotification[] {
  return extractList(data).map(mapNotification);
}

export function unreadCountFrom(
  data: unknown,
  notifications: AppNotification[],
): number {
  const raw = asRecord(data);
  const count = pickNumber(raw.unreadCount, raw.unread_count);
  if (count != null) return count;
  return notifications.filter((n) => !n.read).length;
}
