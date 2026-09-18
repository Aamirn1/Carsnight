import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The terms that govern your use of Cars Night — including listings, payments, crypto, prohibited conduct, and account suspension.",
  alternates: { canonical: "/terms" },
};

const SECTIONS = [
  {
    title: "1. Acceptance of terms",
    body: "By signing up or using Cars Night, you agree to these Terms. If you do not agree, you may not use the platform. We may update these Terms periodically; continued use after changes constitutes acceptance.",
  },
  {
    title: "2. Your account",
    body: "You must be at least 18 years old to create an account. You are responsible for keeping your password secure and for all activity under your account. Notify us immediately of any unauthorized use.",
  },
  {
    title: "3. Listings",
    body: "You may post up to 2 free listings. Additional listings require a paid Pro Plan. Listings must accurately describe the vehicle and may not be misleading. We reserve the right to remove any listing that violates these Terms or is otherwise inappropriate.",
  },
  {
    title: "4. Payments",
    body: "We support credit/debit cards and cryptocurrency (BTC, ETH, USDT). Card payments are processed by our payment provider. Crypto payments are processed on-chain and are final — they cannot be reversed or refunded. By paying with crypto, you acknowledge this finality.",
  },
  {
    title: "5. Prohibited conduct",
    body: "You may not post fraudulent listings, spam, illegal goods, or impersonate others. You may not scrape the site, attempt to bypass rate limits, or attack the infrastructure. Violations may result in immediate account suspension and listing removal.",
  },
  {
    title: "6. No warranty",
    body: "Cars Night is provided 'as is'. We do not guarantee that listings are accurate or that transactions will complete successfully. Always inspect a vehicle in person before paying. We are not a party to any transaction between buyers and sellers.",
  },
  {
    title: "7. Limitation of liability",
    body: "To the maximum extent permitted by law, Cars Night is not liable for any indirect, incidental, or consequential damages arising from your use of the platform. Our total liability is limited to the amount you paid us in the prior 12 months.",
  },
  {
    title: "8. Termination",
    body: "We may suspend or terminate your account at any time for violations of these Terms. You may delete your account at any time by emailing support@carsnight.com.",
  },
  {
    title: "9. Governing law",
    body: "These Terms are governed by the laws of the jurisdiction in which Cars Night is incorporated, without regard to conflict-of-law principles.",
  },
  {
    title: "10. Contact",
    body: "Questions about these Terms? Email legal@carsnight.com.",
  },
];

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <h1 className="text-4xl font-bold tracking-tight">Terms of Service</h1>
      <p className="mt-3 text-sm text-muted-foreground">Last updated: {new Date().getFullYear()}. By using Cars Night, you agree to these Terms.</p>

      <div className="mt-10 space-y-8">
        {SECTIONS.map((s, i) => (
          <section key={i}>
            <h2 className="text-lg font-semibold">{s.title}</h2>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{s.body}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
