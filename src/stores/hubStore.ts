"use client";

import { create } from "zustand";
import type { CountryHub, Hub } from "@/types";

interface HubState {
  hubs: Hub[];
  countries: CountryHub[];
  categories: string[];
  cities: string[];
  allowOther: boolean;
  otherLabel: string;
  selectedCity: string | null;
  selectedLocation: string | null;
  hydrated: boolean;
  setCatalog: (payload: {
    hubs: Hub[];
    countries: CountryHub[];
    categories: string[];
    cities: string[];
    allowOther: boolean;
    otherLabel?: string;
  }) => void;
  setSelection: (city: string | null, location: string | null) => void;
}

export const useHubStore = create<HubState>((set) => ({
  hubs: [],
  countries: [],
  categories: [],
  cities: [],
  allowOther: false,
  otherLabel: "Other",
  selectedCity: null,
  selectedLocation: null,
  hydrated: false,
  setCatalog: (payload) =>
    set({
      ...payload,
      otherLabel: payload.otherLabel || "Other",
      hydrated: true,
    }),
  setSelection: (selectedCity, selectedLocation) =>
    set({ selectedCity, selectedLocation }),
}));
