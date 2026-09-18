"use client";

import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { COUNTRIES, citiesOf } from "@/lib/constants";

interface Props {
  country: string;
  city: string;
  onCountryChange: (c: string) => void;
  onCityChange: (c: string) => void;
  countryPlaceholder?: string;
  cityPlaceholder?: string;
  disabled?: boolean;
  idPrefix?: string;
}

export function CountryCitySelect({
  country,
  city,
  onCountryChange,
  onCityChange,
  countryPlaceholder = "Select country",
  cityPlaceholder = "Select city",
  disabled = false,
  idPrefix = "cc",
}: Props) {
  // Derive cities directly from the country prop — no extra state needed.
  const cities = country ? citiesOf(country) : [];

  // If country changes and the selected city is no longer valid, reset it.
  // We still need an effect to *call back* to the parent when the city becomes invalid,
  // but we do not store local state here.
  useEffect(() => {
    if (city && country && !citiesOf(country).includes(city)) {
      onCityChange("");
    }
  }, [country, city, onCityChange]);

  return (
    <div className="grid sm:grid-cols-2 gap-3">
      <div className="space-y-1.5">
        <label htmlFor={`${idPrefix}-country`} className="text-sm font-medium">Country</label>
        <Select
          value={country || "__none__"}
          onValueChange={(v) => onCountryChange(v === "__none__" ? "" : v)}
          disabled={disabled}
        >
          <SelectTrigger id={`${idPrefix}-country`} className="w-full">
            <SelectValue placeholder={countryPlaceholder} />
          </SelectTrigger>
          <SelectContent className="max-h-72">
            <SelectGroup>
              <SelectLabel>Country</SelectLabel>
              {COUNTRIES.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <label htmlFor={`${idPrefix}-city`} className="text-sm font-medium">City</label>
        <Select
          value={city || "__none__"}
          onValueChange={(v) => onCityChange(v === "__none__" ? "" : v)}
          disabled={disabled || !country}
        >
          <SelectTrigger id={`${idPrefix}-city`} className="w-full">
            <SelectValue placeholder={country ? cityPlaceholder : "Select country first"} />
          </SelectTrigger>
          <SelectContent className="max-h-72">
            <SelectGroup>
              <SelectLabel>{country || "Cities"}</SelectLabel>
              {cities.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
