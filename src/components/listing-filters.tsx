"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useMemo, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, SlidersHorizontal, RotateCcw, ChevronDown } from "lucide-react";
import { COUNTRIES, citiesOf, FUEL_TYPES, TRANSMISSIONS, BODY_TYPES } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface Props {
  category: "SALE" | "RENT";
  /** server-provided price bounds for the slider */
  priceMin?: number;
  priceMax?: number;
}

export function ListingFilters({ category, priceMin = 0, priceMax = 250000 }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const [pending, startTransition] = useTransition();

  const current = useMemo(() => ({
    q: sp.get("q") || "",
    country: sp.get("country") || "",
    city: sp.get("city") || "",
    minPrice: sp.get("minPrice") ? Number(sp.get("minPrice")) : undefined,
    maxPrice: sp.get("maxPrice") ? Number(sp.get("maxPrice")) : undefined,
    fuelType: sp.get("fuelType") || "",
    transmission: sp.get("transmission") || "",
    bodyType: sp.get("bodyType") || "",
    make: sp.get("make") || "",
    sort: sp.get("sort") || "newest",
  }), [sp]);

  const [q, setQ] = useState(current.q);
  const [country, setCountry] = useState(current.country);
  const [city, setCity] = useState(current.city);
  const [priceRange, setPriceRange] = useState<[number, number]>([
    current.minPrice ?? priceMin,
    current.maxPrice ?? priceMax,
  ]);
  const [fuelType, setFuelType] = useState(current.fuelType);
  const [transmission, setTransmission] = useState(current.transmission);
  const [bodyType, setBodyType] = useState(current.bodyType);
  const [make, setMake] = useState(current.make);
  const [sort, setSort] = useState(current.sort);

  const updateUrl = useCallback((next: Record<string, string | undefined>) => {
    const params = new URLSearchParams(sp.toString());
    // Always reset page when filters change
    params.delete("page");
    for (const [k, v] of Object.entries(next)) {
      if (v === undefined || v === "" || v === "all") params.delete(k);
      else params.set(k, v);
    }
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    });
  }, [sp, pathname, router]);

  const onApply = () => {
    updateUrl({
      q, country, city,
      make,
      fuelType, transmission, bodyType,
      minPrice: priceRange[0] !== priceMin ? String(priceRange[0]) : undefined,
      maxPrice: priceRange[1] !== priceMax ? String(priceRange[1]) : undefined,
      sort,
    });
  };

  const onReset = () => {
    setQ(""); setCountry(""); setCity(""); setMake("");
    setFuelType(""); setTransmission(""); setBodyType("");
    setPriceRange([priceMin, priceMax]); setSort("newest");
    startTransition(() => router.push(pathname, { scroll: false }));
  };

  const cities = country ? citiesOf(country) : [];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-base font-semibold">
          <SlidersHorizontal className="h-4 w-4 text-primary" /> Filters
        </h2>
        <Button variant="ghost" size="sm" onClick={onReset} className="h-8 text-xs">
          <RotateCcw className="h-3.5 w-3.5 mr-1" /> Reset
        </Button>
      </div>

      {/* Keyword search */}
      <div className="space-y-1.5">
        <Label htmlFor="filter-q" className="text-xs font-medium">Keyword</Label>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            id="filter-q"
            placeholder="e.g. Tesla, Porsche, Corolla..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onApply()}
            className="pl-8 h-9"
          />
        </div>
      </div>

      {/* Location */}
      <div className="space-y-1.5">
        <Label className="text-xs font-medium">Country</Label>
        <Select value={country || "__all__"} onValueChange={(v) => { setCountry(v === "__all__" ? "" : v); setCity(""); }}>
          <SelectTrigger className="h-9"><SelectValue placeholder="All countries" /></SelectTrigger>
          <SelectContent className="max-h-72">
            <SelectItem value="__all__">All countries</SelectItem>
            {COUNTRIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs font-medium">City</Label>
        <Select value={city || "__all__"} onValueChange={(v) => setCity(v === "__all__" ? "" : v)} disabled={!country}>
          <SelectTrigger className="h-9"><SelectValue placeholder={country ? "All cities" : "Select country first"} /></SelectTrigger>
          <SelectContent className="max-h-72">
            <SelectItem value="__all__">All cities</SelectItem>
            {cities.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Make */}
      <div className="space-y-1.5">
        <Label htmlFor="filter-make" className="text-xs font-medium">Make / Model</Label>
        <Input id="filter-make" placeholder="e.g. Toyota, BMW..." value={make} onChange={(e) => setMake(e.target.value)} className="h-9" />
      </div>

      {/* Price */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-medium">Price range</Label>
          <span className="text-xs text-muted-foreground">
            ${priceRange[0].toLocaleString()} – ${priceRange[1].toLocaleString()}
            {category === "RENT" && <span className="ml-0.5">/day</span>}
          </span>
        </div>
        <Slider
          min={priceMin}
          max={priceMax}
          step={category === "RENT" ? 50 : 5000}
          value={priceRange}
          onValueChange={(v) => setPriceRange([v[0], v[1]] as [number, number])}
          className="py-2"
        />
      </div>

      {/* Fuel type */}
      <FilterGroup label="Fuel type">
        {FUEL_TYPES.map((f) => (
          <CheckboxItem
            key={f}
            label={f}
            checked={fuelType === f}
            onChange={() => setFuelType(fuelType === f ? "" : f)}
          />
        ))}
      </FilterGroup>

      {/* Transmission */}
      <FilterGroup label="Transmission">
        {TRANSMISSIONS.map((t) => (
          <CheckboxItem
            key={t}
            label={t}
            checked={transmission === t}
            onChange={() => setTransmission(transmission === t ? "" : t)}
          />
        ))}
      </FilterGroup>

      {/* Body type */}
      <FilterGroup label="Body type">
        {BODY_TYPES.map((b) => (
          <CheckboxItem
            key={b}
            label={b}
            checked={bodyType === b}
            onChange={() => setBodyType(bodyType === b ? "" : b)}
          />
        ))}
      </FilterGroup>

      {/* Sort */}
      <div className="space-y-1.5">
        <Label className="text-xs font-medium">Sort by</Label>
        <Select value={sort} onValueChange={setSort}>
          <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest first</SelectItem>
            <SelectItem value="price_asc">Price: low to high</SelectItem>
            <SelectItem value="price_desc">Price: high to low</SelectItem>
            <SelectItem value="popular">Most popular</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button onClick={onApply} className="w-full bg-primary text-primary-foreground hover:bg-primary/90" disabled={pending}>
        {pending ? "Applying..." : "Apply filters"}
      </Button>
    </div>
  );
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label className="text-xs font-medium">{label}</Label>
      <div className="grid grid-cols-2 gap-1.5">{children}</div>
    </div>
  );
}

function CheckboxItem({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <label className={cn(
      "flex items-center gap-2 rounded-md border px-2.5 py-1.5 text-xs cursor-pointer transition-colors",
      checked ? "border-primary bg-primary/5 text-foreground" : "border-border hover:bg-muted",
    )}>
      <Checkbox checked={checked} onCheckedChange={onChange} className="h-3.5 w-3.5" />
      <span>{label}</span>
    </label>
  );
}
