import type { CountryHub } from "@/types";

export type HubDraft = {
  country: string;
  city: string;
  customCity: string;
  location: string;
  customLocation: string;
};

export function isOtherSentinel(value: string, otherLabel: string) {
  return value.trim().toLowerCase() === otherLabel.trim().toLowerCase();
}

export function resolvePlaceName(
  selected: string,
  custom: string,
  otherLabel: string,
) {
  if (isOtherSentinel(selected, otherLabel)) return custom.trim();
  return selected.trim();
}

export function assertRealPlace(
  city: string,
  location: string,
  otherLabel: string,
): string | null {
  if (!city || isOtherSentinel(city, otherLabel) || city.length < 2) {
    return `Type a real city — do not save “${otherLabel}”.`;
  }
  if (!location || isOtherSentinel(location, otherLabel) || location.length < 2) {
    return `Type a real neighborhood — do not save “${otherLabel}”.`;
  }
  return null;
}

export function citiesForCountry(
  countries: CountryHub[],
  country: string,
  allowOther: boolean,
  otherLabel: string,
) {
  const hub = countries.find((c) => c.country === country);
  const names = hub ? Object.keys(hub.cities).sort() : [];
  return allowOther ? [...names, otherLabel] : names;
}

export function neighborhoodsForCity(
  countries: CountryHub[],
  country: string,
  city: string,
  allowOther: boolean,
  otherLabel: string,
) {
  if (!city || isOtherSentinel(city, otherLabel)) {
    return allowOther ? [otherLabel] : [];
  }
  const hub = countries.find((c) => c.country === country);
  const names = hub?.cities[city] ?? [];
  return allowOther ? [...names, otherLabel] : names;
}

export function allCities(countries: CountryHub[]) {
  const set = new Set<string>();
  countries.forEach((c) => Object.keys(c.cities).forEach((city) => set.add(city)));
  return [...set].sort();
}

export function currencyForCountry(
  countries: CountryHub[],
  country: string | null | undefined,
): "XAF" | "NGN" {
  const hub = countries.find((c) => c.country === country);
  if (hub?.currency === "NGN" || hub?.currency === "XAF") return hub.currency;
  if (country === "NIGERIA") return "NGN";
  return "XAF";
}

export function countryForCity(countries: CountryHub[], city: string) {
  return countries.find((c) => Object.keys(c.cities).includes(city))?.country ?? "";
}
