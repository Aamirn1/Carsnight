import type { Metadata } from "next";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { HelpCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "FAQ — Cars Night Help Center",
  description: "Answers to common questions about Cars Night: how listings work, free vs. paid ads, crypto payments, security, and more.",
  alternates: { canonical: "/faq" },
};

const FAQS = [
  {
    q: "How many free listings do I get?",
    a: "Every user gets 2 free listings to start. They can be used for cars for sale or for rent. When you run out, you can purchase a Pro Plan for more credits.",
  },
  {
    q: "What is a listing?",
    a: "A listing is one car ad — either for sale (a one-time purchase price) or for rent (a daily, weekly, or monthly rate). One listing = one car.",
  },
  {
    q: "Do credits expire?",
    a: "No. Credits you purchase never expire. Use them whenever you want.",
  },
  {
    q: "Which payment methods do you accept?",
    a: "We accept credit/debit cards (via Stripe) and cryptocurrency: Bitcoin (BTC), Ethereum (ETH), and USDT. Crypto payments are final and cannot be reversed (no chargebacks), which keeps fees low for everyone.",
  },
  {
    q: "Is crypto safe to use here?",
    a: "Yes. Crypto payments are processed by a regulated payment gateway that handles exchange rates and confirms on-chain transactions. We never store your private keys. Always double-check the wallet address before sending.",
  },
  {
    q: "How are listings moderated?",
    a: "All listings are reviewed by our admin team. Spam, fraud, or inappropriate content is removed, and the account may be suspended. We log all admin actions for accountability.",
  },
  {
    q: "How does the site detect my country?",
    a: "When you sign up we ask for your country and city. The site uses this to show you localized listings by default. You can always change filters to browse any country.",
  },
  {
    q: "What if I forget my password?",
    a: "Use the &quot;Forgot password&quot; link on the sign-in page (coming soon). For now, contact support@carsnight.com from your registered email.",
  },
  {
    q: "How do I delete my account?",
    a: "Email support@carsnight.com with your registered email and we will permanently delete your account and personal data within 30 days, per GDPR.",
  },
  {
    q: "Is the site secure?",
    a: "Yes. We follow OWASP best practices: hashed passwords, HTTP-only session cookies, rate limiting on all APIs, strict input validation, parameterized queries, and audit logs. We never store credit card numbers.",
  },
];

export default function FaqPage() {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <div className="text-center">
        <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 border border-primary/20 px-3 py-1 text-xs font-medium text-primary">
          <HelpCircle className="h-3.5 w-3.5" /> Help Center
        </span>
        <h1 className="mt-4 text-4xl font-bold tracking-tight">Frequently asked questions</h1>
        <p className="mt-3 text-muted-foreground">Everything you need to know about buying, selling, and renting on Cars Night.</p>
      </div>

      <div className="mt-10">
        <Accordion type="single" collapsible className="w-full">
          {FAQS.map((f, i) => (
            <AccordionItem key={i} value={`item-${i}`}>
              <AccordionTrigger className="text-left text-base font-medium">{f.q}</AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground leading-relaxed">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
    </div>
  );
}
