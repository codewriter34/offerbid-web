export type Country = "CAMEROON" | "NIGERIA";
export type PrimaryIntent = "BUY" | "SELL" | "BOTH";

export interface User {
  id: string;
  email: string | null;
  fullName: string;
  phone: string | null;
  countryCode: string | null;
  country: Country | string | null;
  primaryIntent?: PrimaryIntent | string | null;
  city: string | null;
  address: string | null;
  location: string | null;
  avatarUrl: string | null;
  profileComplete: boolean;
  isVerified: boolean;
  googleId: string | null;
  createdAt: string | null;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  fullName: string;
  countryCode: string;
  phone: string;
  country: Country;
  primaryIntent?: PrimaryIntent;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface VerifyOtpPayload {
  email: string;
  code: string;
  purpose?: "EMAIL_VERIFY" | "PASSWORD_RESET";
}

export interface CompleteProfilePayload {
  city: string;
  address: string;
  location: string;
  phone?: string;
  countryCode?: string;
}

export type ListingStatus = "ACTIVE" | "SOLD" | "CLOSED";
export type Currency = "XAF" | "NGN";

export interface ListingImage {
  id?: string;
  url: string;
}

export interface ListingSeller {
  id: string | null;
  fullName: string;
  avatarUrl: string | null;
  createdAt: string | null;
}

export interface Listing {
  id: string;
  sellerId: string;
  seller: ListingSeller | null;
  category: string;
  title: string;
  description: string;
  askingPrice: number;
  minBidPrice: number;
  currency: Currency | string;
  status: ListingStatus | string;
  location: string | null;
  city: string | null;
  images: ListingImage[];
  highestBidAmount: number | null;
  bidCount: number | null;
  createdAt: string;
}

export interface ListingsPage {
  listings: Listing[];
  page: number;
  limit: number;
  total: number;
}

export interface CreateListingPayload {
  title: string;
  description: string;
  askingPrice: number;
  minBidPrice?: number;
  currency: Currency;
  category: string;
  location: string;
  images: string[];
}

export type BidStatus =
  | "PENDING"
  | "ACCEPTED"
  | "REJECTED"
  | "COUNTERED"
  | "EXPIRED";

export type BidAction = "ACCEPT" | "REJECT" | "COUNTER";

export interface Bid {
  id: string;
  listingId: string;
  listingTitle?: string;
  listingImageUrl?: string | null;
  listingPlace?: string | null;
  listingCategory?: string | null;
  minBidPrice?: number | null;
  askingPrice?: number | null;
  currency?: string;
  buyerId: string;
  amount: number;
  status: BidStatus | string;
  parentBidId: string | null;
  counterAmount: number | null;
  expiresAt: string | null;
  createdAt: string;
  whatsappUrl: string | null;
}

export interface CreateBidPayload {
  listingId: string;
  offerAmount: number;
}

export interface RespondBidPayload {
  action: BidAction;
  counterAmount?: number;
}

export interface CounterRespondPayload {
  action: "ACCEPT" | "REJECT";
}

export interface Hub {
  id?: string;
  country: string;
  city: string;
  neighborhood: string;
  isActive?: boolean;
}

export interface CountryHub {
  country: string;
  currency: string;
  countryCode: string;
  cities: Record<string, string[]>;
}

export interface HubsResponse {
  hubs: Hub[];
  countries: CountryHub[];
  categories: string[];
  cities: string[];
  allowOther: boolean;
  otherLabel: string;
}

export type NotificationType =
  | "new_bid"
  | "bid_accepted"
  | "bid_rejected"
  | "bid_countered"
  | "bid_expiring"
  | "listing_contact"
  | "unknown";

export interface AppNotification {
  id: string;
  userId: string | null;
  type: NotificationType;
  payload: Record<string, unknown>;
  read: boolean;
  createdAt: string;
  title?: string | null;
  message?: string | null;
}

export type IdentityStatus = "NONE" | "PENDING" | "APPROVED" | "REJECTED";

export type IdKind =
  | "NATIONAL_ID"
  | "PASSPORT"
  | "DRIVERS_LICENSE"
  | "VOTERS_CARD";

export interface Identity {
  status: IdentityStatus;
  idKind: IdKind | null;
  idFrontUrl: string | null;
  idBackUrl: string | null;
  selfieUrl: string | null;
  rejectionReason: string | null;
  listingCap: number;
}

export interface SubmitIdentityPayload {
  idKind: IdKind;
  idFrontUrl: string;
  selfieUrl: string;
  idBackUrl?: string;
  fullNameOnId?: string;
}
