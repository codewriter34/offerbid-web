"use client";

import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import {
  citiesForCountry,
  isOtherSentinel,
  neighborhoodsForCity,
  type HubDraft,
} from "@/lib/hubs";
import { useHubStore } from "@/stores/hubStore";

export function HubFields({
  draft,
  onChange,
  showCountry = true,
  cityRequired = true,
  locationRequired = true,
  numbered = false,
}: {
  draft: HubDraft;
  onChange: (next: HubDraft) => void;
  showCountry?: boolean;
  cityRequired?: boolean;
  locationRequired?: boolean;
  numbered?: boolean;
}) {
  const countries = useHubStore((s) => s.countries);
  const allowOther = useHubStore((s) => s.allowOther);
  const otherLabel = useHubStore((s) => s.otherLabel);

  const countryOptions = countries.map((c) => c.country);
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
      {showCountry ? (
        <Select
          label={step(1, "Country")}
          value={draft.country}
          onChange={(e) =>
            onChange({
              ...draft,
              country: e.target.value,
              city: "",
              customCity: "",
              location: "",
              customLocation: "",
            })
          }
        >
          <option value="">Select country</option>
          {countryOptions.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </Select>
      ) : null}

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
          placeholder="e.g. Limbe"
          required={cityRequired}
        />
      ) : null}

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
          placeholder="e.g. Great Soppo"
          required={locationRequired}
        />
      ) : null}
    </div>
  );
}
