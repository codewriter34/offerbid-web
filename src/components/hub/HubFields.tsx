"use client";

import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { COUNTRY_OPTIONS, countryFlag, countryLabel } from "@/lib/env";
import {
  citiesForCountry,
  isOtherSentinel,
  neighborhoodsForCity,
  type HubDraft,
} from "@/lib/hubs";
import { cn } from "@/lib/cn";
import { useHubStore } from "@/stores/hubStore";

export function HubFields({
  draft,
  onChange,
  showCountry = true,
  cityRequired = true,
  locationRequired = true,
  numbered = false,
  explainSellFrom = true,
}: {
  draft: HubDraft;
  onChange: (next: HubDraft) => void;
  showCountry?: boolean;
  cityRequired?: boolean;
  locationRequired?: boolean;
  numbered?: boolean;
  explainSellFrom?: boolean;
}) {
  const countries = useHubStore((s) => s.countries);
  const allowOther = useHubStore((s) => s.allowOther);
  const otherLabel = useHubStore((s) => s.otherLabel);

  const catalogCountries = countries.map((c) => c.country);
  const countryOptions =
    catalogCountries.length > 0
      ? COUNTRY_OPTIONS.filter((option) =>
          catalogCountries.includes(option.country),
        )
      : COUNTRY_OPTIONS;
  const cityOptions = citiesForCountry(
    countries,
    draft.country,
    allowOther,
    otherLabel,
  );
  const neighborhoodOptions = neighborhoodsForCity(
    countries,
    draft.country,
    draft.city,
    allowOther,
    otherLabel,
  );
  const cityIsOther = isOtherSentinel(draft.city, otherLabel);
  const locationIsOther = isOtherSentinel(draft.location, otherLabel);
  const step = (n: number, label: string) =>
    numbered ? `${n} · ${label}` : label;

  return (
    <div className="space-y-4">
      {explainSellFrom ? (
        <p className="rounded-md border border-primary/20 bg-primary/5 px-3 py-2.5 text-sm leading-relaxed text-ink-secondary">
          Your hub is where you sell from and meet buyers. Pick the country and
          city you actually live in so your listings show in the right place.
        </p>
      ) : null}

      {showCountry ? (
        <div>
          <p className="type-label mb-1.5">{step(1, "Country")}</p>
          <div className="grid grid-cols-2 gap-2">
            {countryOptions.map((option) => {
              const active = draft.country === option.country;
              return (
                <button
                  key={option.country}
                  type="button"
                  onClick={() =>
                    onChange({
                      ...draft,
                      country: option.country,
                      city: "",
                      customCity: "",
                      location: "",
                      customLocation: "",
                    })
                  }
                  className={cn(
                    "flex min-h-12 items-center justify-center gap-2 rounded-md border px-3 text-sm font-semibold transition duration-200",
                    active
                      ? "scale-[1.02] border-primary bg-primary/10 text-primary shadow-rest"
                      : "border-border bg-surface text-ink hover:border-primary/40 hover:bg-canvas",
                  )}
                >
                  <span className="text-lg leading-none" aria-hidden>
                    {option.flag}
                  </span>
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      <div key={draft.country} className="animate-fade-rise space-y-4">
        <Select
          label={step(showCountry ? 2 : 1, "City")}
          required={cityRequired}
          value={draft.city}
          disabled={showCountry && !draft.country}
          onChange={(e) =>
            onChange({
              ...draft,
              city: e.target.value,
              customCity: isOtherSentinel(e.target.value, otherLabel)
                ? draft.customCity
                : "",
              location: "",
              customLocation: "",
            })
          }
        >
          <option value="">Select city</option>
          {cityOptions.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </Select>
        {cityIsOther ? (
          <Input
            label={`Type city (not “${otherLabel}”)`}
            value={draft.customCity}
            onChange={(e) => onChange({ ...draft, customCity: e.target.value })}
            placeholder="Type the real city name"
            required={cityRequired}
          />
        ) : null}

        {draft.city ? (
          <div key={draft.city} className="animate-fade-rise space-y-4">
            <Select
              label={step(showCountry ? 3 : 2, "Neighborhood")}
              required={locationRequired}
              value={draft.location}
              disabled={!draft.city}
              onChange={(e) =>
                onChange({
                  ...draft,
                  location: e.target.value,
                  customLocation: isOtherSentinel(e.target.value, otherLabel)
                    ? draft.customLocation
                    : "",
                })
              }
            >
              <option value="">Select neighborhood</option>
              {neighborhoodOptions.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </Select>
            {locationIsOther ? (
              <Input
                label={`Type neighborhood (not “${otherLabel}”)`}
                value={draft.customLocation}
                onChange={(e) =>
                  onChange({ ...draft, customLocation: e.target.value })
                }
                placeholder="Type the real neighborhood"
                required={locationRequired}
              />
            ) : null}
          </div>
        ) : null}

        {draft.country ? (
          <p className="type-meta">
            {countryFlag(draft.country)} Selling from{" "}
            {countryLabel(draft.country)}
            {draft.city ? ` · ${draft.city}` : ""}
          </p>
        ) : null}
      </div>
    </div>
  );
}
