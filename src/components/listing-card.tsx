import Link from "next/link";
import Image from "next/image";
import { MapPin, Gauge, Fuel, Settings2, Calendar, Eye, Crown } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatPrice, formatPeriod, type PublicListing } from "@/lib/constants";

interface Props {
  listing: PublicListing;
  priority?: boolean;
}

export function ListingCard({ listing, priority = false }: Props) {
  const img = listing.images?.[0] || "/cars/porsche-red.png";
  const isRent = listing.category === "RENT";
  const href = `/listing/${listing.slug || listing.id}`;

  return (
    <Link href={href} className="group block h-full" aria-label={`${listing.title} in ${listing.city}`}>
      <Card className="card-3d h-full overflow-hidden border-border/70 shadow-sm hover:shadow-xl hover:border-primary/40 transition-all duration-300">
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          <Image
            src={img}
            alt={`${listing.color || ""} ${listing.make} ${listing.model} for ${isRent ? "rent" : "sale"} in ${listing.city}`.trim()}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            priority={priority}
          />
          <div className="absolute left-2 top-2 flex flex-wrap gap-1">
            <Badge variant="secondary" className="bg-white/90 text-foreground shadow">
              {isRent ? "For Rent" : "For Sale"}
            </Badge>
            {listing.featured && (
              <Badge className="btn-neon text-white shadow">
                <Crown className="h-3 w-3 mr-1" /> Featured
              </Badge>
            )}
          </div>
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2 text-white text-xs">
            <div className="flex items-center gap-1">
              <Eye className="h-3 w-3" /> {listing.views.toLocaleString()} views
            </div>
          </div>
        </div>

        <div className="p-4">
          <h3 className="font-semibold text-base text-foreground line-clamp-1 group-hover:text-primary transition-colors">
            {listing.title}
          </h3>
          <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 text-primary" />
            <span className="line-clamp-1">{listing.city}, {listing.country}</span>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
            {listing.year && (
              <div className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {listing.year}</div>
            )}
            {listing.mileage != null && (
              <div className="flex items-center gap-1"><Gauge className="h-3.5 w-3.5" /> {listing.mileage.toLocaleString()} mi</div>
            )}
            {listing.fuelType && (
              <div className="flex items-center gap-1"><Fuel className="h-3.5 w-3.5" /> {listing.fuelType}</div>
            )}
            {listing.transmission && (
              <div className="flex items-center gap-1"><Settings2 className="h-3.5 w-3.5" /> {listing.transmission}</div>
            )}
          </div>

          <div className="mt-3 flex items-end justify-between">
            <div>
              <div className="text-xl font-bold text-primary">{formatPrice(listing.price, listing.currency)}</div>
              {isRent && (
                <div className="text-xs text-muted-foreground">{formatPeriod(listing.rentalPeriod)}</div>
              )}
            </div>
            <Badge variant="outline" className="text-xs">
              {listing.make}
            </Badge>
          </div>
        </div>
      </Card>
    </Link>
  );
}
