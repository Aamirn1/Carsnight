"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Tag,
  Car,
  Coins,
  ListChecks,
  ImageIcon,
  Loader2,
  Save,
  ArrowLeft,
  AlertTriangle,
  Sparkles,
  MapPin,
  Camera,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { CountryCitySelect } from "@/components/country-city-select";
import { ImageUpload } from "@/components/image-upload";
import {
  FUEL_TYPES,
  TRANSMISSIONS,
  BODY_TYPES,
  RENTAL_PERIODS,
  formatPrice,
  formatPeriod,
  type PublicListing,
} from "@/lib/constants";

interface QuotaInfo {
  freeRemaining: number;
  paidRemaining: number;
  total: number;
  freeUsed: number;
  freeLimit: number;
}

interface Props {
  initialListing: PublicListing | null;
  editError: string | null;
  quota: QuotaInfo;
}

interface FormState {
  category: "SALE" | "RENT";
  title: string;
  make: string;
  model: string;
  year: string;
  mileage: string;
  fuelType: string;
  transmission: string;
  bodyType: string;
  color: string;
  country: string;
  city: string;
  price: string;
  rentalPeriod: string;
  description: string;
  images: string[];
}

const CURRENT_YEAR = new Date().getFullYear();

function emptyForm(): FormState {
  return {
    category: "SALE",
    title: "",
    make: "",
    model: "",
    year: String(CURRENT_YEAR),
    mileage: "",
    fuelType: "",
    transmission: "",
    bodyType: "",
    color: "",
    country: "",
    city: "",
    price: "",
    rentalPeriod: "day",
    description: "",
    images: [],
  };
}

function fromListing(l: PublicListing): FormState {
  return {
    category: (l.category === "RENT" ? "RENT" : "SALE") as "SALE" | "RENT",
    title: l.title,
    make: l.make,
    model: l.model,
    year: l.year != null ? String(l.year) : "",
    mileage: l.mileage != null ? String(l.mileage) : "",
    fuelType: l.fuelType || "",
    transmission: l.transmission || "",
    bodyType: l.bodyType || "",
    color: l.color || "",
    country: l.country,
    city: l.city,
    price: String(l.price),
    rentalPeriod: l.rentalPeriod || "day",
    description: l.description,
    images: l.images || [],
  };
}

export function PostAdForm({ initialListing, editError, quota }: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const [form, setForm] = useState<FormState>(
    initialListing ? fromListing(initialListing) : emptyForm()
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const isEdit = !!initialListing;

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: "" }));
  };

  const validate = (): Record<string, string> => {
    const e: Record<string, string> = {};
    if (form.title.trim().length < 5) e.title = "Title must be at least 5 characters.";
    if (form.make.trim().length < 2) e.make = "Make is required (min 2 chars).";
    if (form.model.trim().length < 1) e.model = "Model is required.";
    const yr = Number(form.year);
    if (!form.year || !Number.isFinite(yr) || yr < 1900 || yr > CURRENT_YEAR + 1) {
      e.year = `Year must be between 1900 and ${CURRENT_YEAR + 1}.`;
    }
    if (form.mileage && (!Number.isFinite(Number(form.mileage)) || Number(form.mileage) < 0)) {
      e.mileage = "Mileage must be a positive number.";
    }
    const price = Number(form.price);
    if (!form.price || !Number.isFinite(price) || price <= 0) {
      e.price = "Price must be greater than 0.";
    }
    if (form.category === "RENT" && !RENTAL_PERIODS.includes(form.rentalPeriod as any)) {
      e.rentalPeriod = "Choose a rental period.";
    }
    if (form.description.trim().length < 20) {
      e.description = "Description must be at least 20 characters.";
    }
    if (!form.country) e.country = "Country is required.";
    if (!form.city) e.city = "City is required.";
    if (form.images.length === 0) e.images = "At least one image is required.";
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      toast({
        variant: "destructive",
        title: "Please check the form",
        description: "Some fields need your attention.",
      });
      // Scroll to first error
      const firstKey = Object.keys(errs)[0];
      if (firstKey) {
        const el = document.getElementById(`field-${firstKey}`);
        el?.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    if (!isEdit && quota.total <= 0) {
      toast({
        variant: "destructive",
        title: "Out of listing credits",
        description: "Buy credits to publish a new ad.",
        action: (
          <Button asChild size="sm" variant="outline">
            <Link href="/pricing">Buy credits</Link>
          </Button>
        ),
      });
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category,
        make: form.make.trim(),
        model: form.model.trim(),
        year: Number(form.year),
        mileage: form.mileage ? Number(form.mileage) : null,
        fuelType: form.fuelType || null,
        transmission: form.transmission || null,
        bodyType: form.bodyType || null,
        color: form.color.trim() || null,
        country: form.country,
        city: form.city,
        price: Number(form.price),
        rentalPeriod: form.category === "RENT" ? form.rentalPeriod : null,
        images: form.images,
      };

      const url = isEdit ? `/api/listings/${initialListing!.id}` : "/api/listings";
      const method = isEdit ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));

      if (res.status === 402) {
        toast({
          variant: "destructive",
          title: "Quota exceeded",
          description: data.error || "You've reached your listing limit.",
          action: (
            <Button asChild size="sm" variant="outline">
              <Link href="/pricing">Buy credits</Link>
            </Button>
          ),
        });
        return;
      }
      if (!res.ok) {
        toast({
          variant: "destructive",
          title: "Could not save listing",
          description: data.error || "Please check the form and try again.",
        });
        return;
      }

      toast({
        title: isEdit ? "Listing updated!" : "Listing published!",
        description: isEdit
          ? "Your changes have been saved."
          : "Your ad is now live on Cars Night.",
      });
      router.push("/dashboard");
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Network error",
        description: err.message || "Could not reach the server.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Live preview
  const preview = useMemo(() => {
    return {
      title: form.title.trim() || "Your car title",
      price: Number(form.price) || 0,
      country: form.country,
      city: form.city,
      make: form.make.trim() || "—",
      model: form.model.trim() || "—",
      year: form.year,
      images: form.images,
      category: form.category,
      rentalPeriod: form.rentalPeriod,
    };
  }, [form]);

  if (editError) {
    return (
      <Card className="border-destructive/30 bg-destructive/5">
        <CardContent className="py-12 text-center space-y-3">
          <AlertTriangle className="h-10 w-10 text-destructive mx-auto" />
          <h2 className="text-xl font-bold">Cannot edit this listing</h2>
          <p className="text-sm text-muted-foreground">{editError}</p>
          <Button asChild>
            <Link href="/dashboard">Back to dashboard</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <Button asChild variant="ghost" size="sm" className="mb-2 -ml-2 text-muted-foreground">
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4" /> Back to dashboard
            </Link>
          </Button>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            {isEdit ? "Edit your ad" : "Post a new ad"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isEdit
              ? "Update the details below and save your changes."
              : "Reach thousands of buyers and renters worldwide."}
          </p>
        </div>
      </div>

      {/* Quota banner */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6 justify-between">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-primary/15 grid place-items-center shrink-0">
                <ListChecks className="h-5 w-5 text-primary" />
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                <span className="flex items-center gap-1.5">
                  <Tag className="h-3.5 w-3.5 text-primary" />
                  <strong className="font-semibold">{quota.freeRemaining}</strong>
                  <span className="text-muted-foreground">free posts</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <Coins className="h-3.5 w-3.5 text-primary" />
                  <strong className="font-semibold">{quota.paidRemaining}</strong>
                  <span className="text-muted-foreground">paid credits</span>
                </span>
              </div>
            </div>
            {!isEdit && quota.total === 0 && (
              <Button asChild size="sm">
                <Link href="/pricing">Buy credits <ArrowLeft className="h-3.5 w-3.5 rotate-180" /></Link>
              </Button>
            )}
          </div>
          {!isEdit && quota.total === 0 && (
            <p className="text-xs text-destructive mt-3 flex items-center gap-1.5">
              <AlertTriangle className="h-3.5 w-3.5" />
              You&apos;re out of listing credits. Buy credits to publish a new ad.
            </p>
          )}
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Form */}
        <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6">
          {/* Category */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Car className="h-4 w-4 text-primary" /> Category
              </CardTitle>
              <CardDescription>Is this car for sale or for rent?</CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={form.category}
                onValueChange={(v) => set("category", v as "SALE" | "RENT")}
                className="grid grid-cols-2 gap-3"
              >
                <label
                  htmlFor="cat-sale"
                  className={`flex items-center gap-3 rounded-lg border p-4 cursor-pointer transition-colors ${
                    form.category === "SALE"
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/40"
                  }`}
                >
                  <RadioGroupItem value="SALE" id="cat-sale" />
                  <div>
                    <div className="font-semibold flex items-center gap-1.5">
                      <Tag className="h-3.5 w-3.5 text-primary" /> For Sale
                    </div>
                    <div className="text-xs text-muted-foreground">List your car for sale</div>
                  </div>
                </label>
                <label
                  htmlFor="cat-rent"
                  className={`flex items-center gap-3 rounded-lg border p-4 cursor-pointer transition-colors ${
                    form.category === "RENT"
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/40"
                  }`}
                >
                  <RadioGroupItem value="RENT" id="cat-rent" />
                  <div>
                    <div className="font-semibold flex items-center gap-1.5">
                      <Car className="h-3.5 w-3.5 text-primary" /> For Rent
                    </div>
                    <div className="text-xs text-muted-foreground">List your car for rent</div>
                  </div>
                </label>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Basics */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Basic information</CardTitle>
              <CardDescription>Tell buyers what you&apos;re offering.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div id="field-title" className="space-y-1.5">
                <Label htmlFor="title">Ad title *</Label>
                <Input
                  id="title"
                  value={form.title}
                  onChange={(e) => set("title", e.target.value)}
                  placeholder="e.g. 2021 Toyota Corolla SE — Low Mileage"
                  maxLength={120}
                  aria-invalid={!!errors.title}
                />
                {errors.title && <p className="text-xs text-destructive">{errors.title}</p>}
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div id="field-make" className="space-y-1.5">
                  <Label htmlFor="make">Make *</Label>
                  <Input
                    id="make"
                    value={form.make}
                    onChange={(e) => set("make", e.target.value)}
                    placeholder="Toyota"
                    maxLength={60}
                    aria-invalid={!!errors.make}
                  />
                  {errors.make && <p className="text-xs text-destructive">{errors.make}</p>}
                </div>
                <div id="field-model" className="space-y-1.5">
                  <Label htmlFor="model">Model *</Label>
                  <Input
                    id="model"
                    value={form.model}
                    onChange={(e) => set("model", e.target.value)}
                    placeholder="Corolla SE"
                    maxLength={60}
                    aria-invalid={!!errors.model}
                  />
                  {errors.model && <p className="text-xs text-destructive">{errors.model}</p>}
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div id="field-year" className="space-y-1.5">
                  <Label htmlFor="year">Year *</Label>
                  <Input
                    id="year"
                    type="number"
                    value={form.year}
                    onChange={(e) => set("year", e.target.value)}
                    placeholder={String(CURRENT_YEAR)}
                    min={1900}
                    max={CURRENT_YEAR + 1}
                    aria-invalid={!!errors.year}
                  />
                  {errors.year && <p className="text-xs text-destructive">{errors.year}</p>}
                </div>
                <div id="field-mileage" className="space-y-1.5">
                  <Label htmlFor="mileage">Mileage (miles)</Label>
                  <Input
                    id="mileage"
                    type="number"
                    value={form.mileage}
                    onChange={(e) => set("mileage", e.target.value)}
                    placeholder="e.g. 25000"
                    min={0}
                    aria-invalid={!!errors.mileage}
                  />
                  {errors.mileage && <p className="text-xs text-destructive">{errors.mileage}</p>}
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="fuelType">Fuel type</Label>
                  <Select value={form.fuelType || "__none__"} onValueChange={(v) => set("fuelType", v === "__none__" ? "" : v)}>
                    <SelectTrigger id="fuelType" className="w-full">
                      <SelectValue placeholder="Any" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">Any</SelectItem>
                      {FUEL_TYPES.map((f) => (
                        <SelectItem key={f} value={f}>{f}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="transmission">Transmission</Label>
                  <Select value={form.transmission || "__none__"} onValueChange={(v) => set("transmission", v === "__none__" ? "" : v)}>
                    <SelectTrigger id="transmission" className="w-full">
                      <SelectValue placeholder="Any" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">Any</SelectItem>
                      {TRANSMISSIONS.map((t) => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="bodyType">Body type</Label>
                  <Select value={form.bodyType || "__none__"} onValueChange={(v) => set("bodyType", v === "__none__" ? "" : v)}>
                    <SelectTrigger id="bodyType" className="w-full">
                      <SelectValue placeholder="Any" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">Any</SelectItem>
                      {BODY_TYPES.map((b) => (
                        <SelectItem key={b} value={b}>{b}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="color">Color</Label>
                <Input
                  id="color"
                  value={form.color}
                  onChange={(e) => set("color", e.target.value)}
                  placeholder="e.g. Midnight Black"
                  maxLength={30}
                />
              </div>
            </CardContent>
          </Card>

          {/* Location */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" /> Location
              </CardTitle>
              <CardDescription>Where is the car located?</CardDescription>
            </CardHeader>
            <CardContent>
              <div id="field-country">
                <CountryCitySelect
                  country={form.country}
                  city={form.city}
                  onCountryChange={(c) => {
                    set("country", c);
                  }}
                  onCityChange={(c) => set("city", c)}
                  idPrefix="postad"
                />
                {errors.country && <p className="text-xs text-destructive mt-2">{errors.country}</p>}
                {errors.city && !errors.country && <p className="text-xs text-destructive mt-2">{errors.city}</p>}
              </div>
            </CardContent>
          </Card>

          {/* Pricing */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Coins className="h-4 w-4 text-primary" /> Pricing
              </CardTitle>
              <CardDescription>
                {form.category === "RENT" ? "Set the rental price and period." : "Set the sale price."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div id="field-price" className="space-y-1.5">
                  <Label htmlFor="price">Price (USD) *</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                    <Input
                      id="price"
                      type="number"
                      value={form.price}
                      onChange={(e) => set("price", e.target.value)}
                      placeholder="0"
                      min={0}
                      step="any"
                      className="pl-7"
                      aria-invalid={!!errors.price}
                    />
                  </div>
                  {errors.price && <p className="text-xs text-destructive">{errors.price}</p>}
                </div>
                {form.category === "RENT" && (
                  <div id="field-rentalPeriod" className="space-y-1.5">
                    <Label htmlFor="rentalPeriod">Rental period</Label>
                    <Select value={form.rentalPeriod} onValueChange={(v) => set("rentalPeriod", v)}>
                      <SelectTrigger id="rentalPeriod" className="w-full">
                        <SelectValue placeholder="Select period" />
                      </SelectTrigger>
                      <SelectContent>
                        {RENTAL_PERIODS.map((p) => (
                          <SelectItem key={p} value={p}>
                            {p === "day" ? "Per day" : p === "week" ? "Per week" : "Per month"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.rentalPeriod && <p className="text-xs text-destructive">{errors.rentalPeriod}</p>}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Description */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Description</CardTitle>
              <CardDescription>Tell buyers about the condition, history, and any extras.</CardDescription>
            </CardHeader>
            <CardContent>
              <div id="field-description" className="space-y-1.5">
                <Textarea
                  value={form.description}
                  onChange={(e) => set("description", e.target.value)}
                  placeholder="Describe the car's condition, features, service history, and any extras included..."
                  rows={6}
                  maxLength={4000}
                  aria-invalid={!!errors.description}
                />
                <div className="flex items-center justify-between text-xs">
                  {errors.description ? (
                    <p className="text-destructive">{errors.description}</p>
                  ) : (
                    <span className="text-muted-foreground">Minimum 20 characters.</span>
                  )}
                  <span className="text-muted-foreground">{form.description.length}/4000</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Images */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Camera className="h-4 w-4 text-primary" /> Photos
              </CardTitle>
              <CardDescription>Upload up to 5 photos. The first photo is the cover.</CardDescription>
            </CardHeader>
            <CardContent>
              <div id="field-images">
                <ImageUpload images={form.images} onChange={(imgs) => set("images", imgs)} max={5} />
                {errors.images && <p className="text-xs text-destructive mt-2">{errors.images}</p>}
              </div>
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 justify-end">
            <Button asChild variant="outline" type="button" disabled={submitting}>
              <Link href="/dashboard">Cancel</Link>
            </Button>
            <Button type="submit" disabled={submitting} size="lg">
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {isEdit ? "Saving..." : "Publishing..."}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  {isEdit ? "Save changes" : "Publish ad"}
                </>
              )}
            </Button>
          </div>
        </form>

        {/* Right sidebar: preview + tips */}
        <aside className="space-y-6 lg:sticky lg:top-20 self-start">
          {/* Live preview */}
          <Card className="shadow-sm overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" /> Live preview
              </CardTitle>
              <CardDescription>How your ad will appear.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-muted">
                {preview.images.length > 0 ? (
                  <Image
                    src={preview.images[0]}
                    alt={preview.title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 320px"
                    className="object-cover"
                  />
                ) : (
                  <div className="h-full w-full grid place-items-center text-muted-foreground">
                    <div className="text-center">
                      <ImageIcon className="h-8 w-8 mx-auto mb-1" />
                      <p className="text-xs">No photo yet</p>
                    </div>
                  </div>
                )}
                <div className="absolute top-2 left-2">
                  <Badge variant="secondary" className="bg-white/90 text-foreground shadow">
                    {preview.category === "RENT" ? "For Rent" : "For Sale"}
                  </Badge>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-foreground line-clamp-1">{preview.title}</h3>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                  <MapPin className="h-3 w-3 text-primary" />
                  {preview.city ? `${preview.city}, ${preview.country}` : "Select location"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {preview.make} {preview.model} {preview.year && `· ${preview.year}`}
                </p>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-xl font-bold text-primary">
                    {preview.price > 0 ? formatPrice(preview.price, "USD") : "$—"}
                  </span>
                  {preview.category === "RENT" && preview.price > 0 && (
                    <span className="text-xs text-muted-foreground">
                      {formatPeriod(preview.rentalPeriod)}
                    </span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tips */}
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" /> Tips for a great ad
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2.5 text-sm">
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                  <span>Use clear, well-lit photos — show all angles of the car.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                  <span>Set a fair, accurate price based on market research.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                  <span>Be honest about the car&apos;s condition and history.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                  <span>Respond quickly to buyer messages to close deals faster.</span>
                </li>
              </ul>
              <Separator className="my-4" />
              <p className="text-xs text-muted-foreground">
                Need more credits?{" "}
                <Link href="/pricing" className="text-primary underline underline-offset-4">
                  Browse plans
                </Link>
                .
              </p>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
