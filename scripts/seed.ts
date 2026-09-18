import { db } from "../src/lib/db";
import { hashPassword } from "../src/lib/auth";

const ADMIN_EMAIL = "amir03115794492@gmail.com";
const ADMIN_PASSWORD = "@#$&16609";

const carImages = {
  porsche: "/cars/porsche-red.png",
  tesla: "/cars/tesla-white.png",
  mercedes: "/cars/mercedes-black.png",
  toyota: "/cars/toyota-blue.png",
  lambo: "/cars/lambo-yellow.png",
  bmw: "/cars/bmw-silver.png",
  rover: "/cars/rover-green.png",
  audi: "/cars/audi-orange.png",
};

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

async function main() {
  console.log("Seeding Cars Night database...");

  // --- Admin user
  const adminHash = await hashPassword(ADMIN_PASSWORD);
  const admin = await db.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: { passwordHash: adminHash, role: "ADMIN" },
    create: {
      email: ADMIN_EMAIL,
      name: "Amir (Admin)",
      passwordHash: adminHash,
      role: "ADMIN",
      country: "Pakistan",
      city: "Karachi",
    },
  });
  console.log("Admin user ready:", admin.email);

  // --- Demo user
  const demoHash = await hashPassword("demo1234");
  const demo = await db.user.upsert({
    where: { email: "demo@carsnight.com" },
    update: {},
    create: {
      email: "demo@carsnight.com",
      name: "Demo User",
      passwordHash: demoHash,
      role: "USER",
      country: "United States",
      city: "New York",
    },
  });
  console.log("Demo user ready:", demo.email);

  // --- Seller users
  const sellers = [
    { email: "seller1@carsnight.com", name: "Auto Premium NYC", country: "United States", city: "New York" },
    { email: "seller2@carsnight.com", name: "London Motors", country: "United Kingdom", city: "London" },
    { email: "seller3@carsnight.com", name: "Karachi Auto Hub", country: "Pakistan", city: "Karachi" },
    { email: "seller4@carsnight.com", name: "Tokyo Wheels", country: "Japan", city: "Tokyo" },
    { email: "seller5@carsnight.com", name: "Dubai Luxury Cars", country: "United Arab Emirates", city: "Dubai" },
  ];
  for (const s of sellers) {
    const h = await hashPassword("seller123");
    await db.user.upsert({
      where: { email: s.email },
      update: {},
      create: { ...s, passwordHash: h, role: "USER", freePostsUsed: 2, listingCredits: 5 },
    });
  }
  const allSellers = await db.user.findMany({ where: { email: { in: sellers.map((s) => s.email) } } });

  // --- Plans
  const plans = [
    { name: "Starter", price: 5, currency: "USD", credits: 3, description: "3 extra listings" },
    { name: "Pro", price: 8, currency: "USD", credits: 5, description: "5 extra listings" },
    { name: "Business", price: 10, currency: "USD", credits: 10, description: "10 extra listings" },
  ];
  for (const p of plans) {
    const existing = await db.plan.findFirst({ where: { name: p.name } });
    if (existing) {
      await db.plan.update({ where: { id: existing.id }, data: p });
    } else {
      await db.plan.create({ data: p });
    }
  }
  console.log("Plans ready");

  // --- Settings
  const settings = [
    { key: "site_name", value: "Cars Night" },
    { key: "tagline", value: "Your global car marketplace, no gravity needed!" },
    { key: "contact_email", value: "support@carsnight.com" },
    { key: "hero_video_url", value: "" },
    { key: "announcement", value: "Crypto payments now accepted - pay with BTC, ETH, or USDT!" },
  ];
  for (const s of settings) {
    const existing = await db.setting.findUnique({ where: { key: s.key } });
    if (existing) await db.setting.update({ where: { id: existing.id }, data: { value: s.value } });
    else await db.setting.create({ data: s });
  }
  console.log("Settings ready");

  // --- Listings
  const listings = [
    { sellerIdx: 0, title: "2021 Porsche 911 Carrera", category: "SALE", price: 95000, make: "Porsche", model: "911 Carrera", year: 2021, mileage: 12000, fuelType: "Petrol", transmission: "Automatic", bodyType: "Coupe", color: "Red", country: "United States", city: "New York", img: carImages.porsche, desc: "Stunning 2021 Porsche 911 Carrera in pristine condition. Single owner, full service history, premium leather interior, sport exhaust. A dream car for enthusiasts.", featured: true },
    { sellerIdx: 4, title: "2020 Lamborghini Huracan EVO", category: "SALE", price: 220000, make: "Lamborghini", model: "Huracan EVO", year: 2020, mileage: 8500, fuelType: "Petrol", transmission: "Automatic", bodyType: "Coupe", color: "Yellow", country: "United Arab Emirates", city: "Dubai", img: carImages.lambo, desc: "Lamborghini Huracan EVO in show-room condition. V10 engine, 640 HP, carbon ceramic brakes. Rare opportunity to own a supercar.", featured: true },
    { sellerIdx: 0, title: "2022 Tesla Model 3 Long Range", category: "SALE", price: 42000, make: "Tesla", model: "Model 3", year: 2022, mileage: 18000, fuelType: "Electric", transmission: "Automatic", bodyType: "Sedan", color: "White", country: "United States", city: "New York", img: carImages.tesla, desc: "Tesla Model 3 Long Range, full self-driving capability included. Superb range, autopilot, minimalist interior. Excellent daily driver.", featured: true },
    { sellerIdx: 1, title: "2019 Mercedes-Benz S-Class 450", category: "SALE", price: 68000, make: "Mercedes-Benz", model: "S-Class", year: 2019, mileage: 32000, fuelType: "Petrol", transmission: "Automatic", bodyType: "Sedan", color: "Black", country: "United Kingdom", city: "London", img: carImages.mercedes, desc: "Mercedes-Benz S-Class 450 luxury sedan. Executive spec, panoramic roof, massage seats, night vision. Immaculate condition.", featured: true },
    { sellerIdx: 2, title: "2020 Toyota Corolla GLi", category: "SALE", price: 18500, make: "Toyota", model: "Corolla", year: 2020, mileage: 28000, fuelType: "Petrol", transmission: "Automatic", bodyType: "Sedan", color: "Blue", country: "Pakistan", city: "Karachi", img: carImages.toyota, desc: "Toyota Corolla GLi, fuel efficient and reliable. Single owner, serviced regularly. Perfect family car in excellent condition." },
    { sellerIdx: 3, title: "2023 BMW M4 Competition", category: "SALE", price: 88000, make: "BMW", model: "M4 Competition", year: 2023, mileage: 5000, fuelType: "Petrol", transmission: "Automatic", bodyType: "Coupe", color: "Silver", country: "Japan", city: "Tokyo", img: carImages.bmw, desc: "BMW M4 Competition, near-new condition. 503 HP twin-turbo inline-6, carbon roof, M Sport seats. Performance perfection.", featured: true },
    { sellerIdx: 4, title: "2021 Range Rover Sport HSE", category: "SALE", price: 92000, make: "Land Rover", model: "Range Rover Sport", year: 2021, mileage: 22000, fuelType: "Diesel", transmission: "Automatic", bodyType: "SUV", color: "Green", country: "United Arab Emirates", city: "Dubai", img: carImages.rover, desc: "Range Rover Sport HSE, full luxury spec. Air suspension, terrain response, premium audio. Desert-ready and city-smooth." },
    { sellerIdx: 0, title: "2022 Audi R8 V10 Performance", category: "SALE", price: 175000, make: "Audi", model: "R8 V10", year: 2022, mileage: 6000, fuelType: "Petrol", transmission: "Automatic", bodyType: "Coupe", color: "Orange", country: "United States", city: "New York", img: carImages.audi, desc: "Audi R8 V10 Performance, the last of the legendary V10 supercars. Quattro AWD, ceramic brakes, virtual cockpit. Collector grade." },

    // Rentals
    { sellerIdx: 0, title: "Rent a 2021 Porsche 911 Carrera", category: "RENT", price: 450, rentalPeriod: "day", make: "Porsche", model: "911 Carrera", year: 2021, mileage: 12000, fuelType: "Petrol", transmission: "Automatic", bodyType: "Coupe", color: "Red", country: "United States", city: "New York", img: carImages.porsche, desc: "Rent your dream car for special events! Porsche 911 available for daily rental. Perfect for weddings, photoshoots, and unforgettable weekends.", featured: true },
    { sellerIdx: 4, title: "Rent a 2020 Lamborghini Huracan", category: "RENT", price: 1200, rentalPeriod: "day", make: "Lamborghini", model: "Huracan", year: 2020, mileage: 8500, fuelType: "Petrol", transmission: "Automatic", bodyType: "Coupe", color: "Yellow", country: "United Arab Emirates", city: "Dubai", img: carImages.lambo, desc: "Experience the thrill of a Lamborghini for a day. Insurance included, professional delivery. Make your Dubai trip unforgettable.", featured: true },
    { sellerIdx: 1, title: "Rent a 2019 Mercedes S-Class", category: "RENT", price: 280, rentalPeriod: "day", make: "Mercedes-Benz", model: "S-Class", year: 2019, mileage: 32000, fuelType: "Petrol", transmission: "Automatic", bodyType: "Sedan", color: "Black", country: "United Kingdom", city: "London", img: carImages.mercedes, desc: "Chauffeur-grade luxury for business or pleasure. Mercedes S-Class rental with executive amenities. Daily, weekly, and monthly rates available." },
    { sellerIdx: 3, title: "Rent a 2023 BMW M4 Competition", category: "RENT", price: 380, rentalPeriod: "day", make: "BMW", model: "M4 Competition", year: 2023, mileage: 5000, fuelType: "Petrol", transmission: "Automatic", bodyType: "Coupe", color: "Silver", country: "Japan", city: "Tokyo", img: carImages.bmw, desc: "Track-ready BMW M4 available for rent. Perfect for driving enthusiasts visiting Tokyo. Manual available on request." },
    { sellerIdx: 4, title: "Rent a 2021 Range Rover Sport", category: "RENT", price: 350, rentalPeriod: "day", make: "Land Rover", model: "Range Rover Sport", year: 2021, mileage: 22000, fuelType: "Diesel", transmission: "Automatic", bodyType: "SUV", color: "Green", country: "United Arab Emirates", city: "Dubai", img: carImages.rover, desc: "Conquer the dunes or cruise the city. Range Rover Sport rental with desert-friendly tires. Family-friendly and luxurious." },
    { sellerIdx: 0, title: "Rent a 2022 Tesla Model 3", category: "RENT", price: 120, rentalPeriod: "day", make: "Tesla", model: "Model 3", year: 2022, mileage: 18000, fuelType: "Electric", transmission: "Automatic", bodyType: "Sedan", color: "White", country: "United States", city: "New York", img: carImages.tesla, desc: "Silent, fast, eco-friendly. Tesla Model 3 rental with autopilot. Free Supercharging included. The smart choice for modern travelers." },
  ];

  // Clear existing listings for reseed (only seed data, keep user data)
  await db.listing.deleteMany({});
  for (const l of listings) {
    const seller = allSellers[l.sellerIdx];
    const slug = slugify(`${l.year ?? ""} ${l.make} ${l.model} ${l.city}`);
    await db.listing.create({
      data: {
        title: l.title,
        description: l.desc,
        category: l.category,
        price: l.price,
        currency: "USD",
        make: l.make,
        model: l.model,
        year: l.year ?? null,
        mileage: l.mileage ?? null,
        fuelType: l.fuelType ?? null,
        transmission: l.transmission ?? null,
        bodyType: l.bodyType ?? null,
        color: l.color ?? null,
        country: l.country,
        city: l.city,
        rentalPeriod: (l as any).rentalPeriod ?? null,
        images: JSON.stringify([l.img, l.img, l.img]),
        status: "APPROVED",
        paidType: "FREE",
        featured: l.featured ?? false,
        slug,
        userId: seller.id,
      },
    });
  }
  console.log(`Seeded ${listings.length} listings`);

  console.log("Seed complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
