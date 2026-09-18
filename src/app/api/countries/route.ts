import { NextResponse } from "next/server";
import { COUNTRY_CITIES, COUNTRIES } from "@/lib/constants";

// GET /api/countries - return list of countries and their cities
export async function GET(req: Request) {
  const url = new URL(req.url);
  const country = url.searchParams.get("country");
  if (country) {
    return NextResponse.json({ country, cities: COUNTRY_CITIES[country] ?? [] });
  }
  return NextResponse.json({ countries: COUNTRIES, countryCities: COUNTRY_CITIES });
}
