import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Cars Night collects, uses, and protects your personal data. GDPR-aligned, minimal data, no selling of personal info.",
  alternates: { canonical: "/privacy" },
};

const SECTIONS = [
  {
    title: "1. What we collect",
    body: "We collect your email, password (hashed with bcrypt), name, country, and city when you sign up. We also store the listings you create (including photos), and transaction records for subscription purchases. We log admin actions and security events (failed logins, etc.) in audit logs.",
  },
  {
    title: "2. How we use your data",
    body: "Your data is used to operate the marketplace: showing your listings, processing payments, preventing fraud, and providing support. We never sell your personal information to third parties.",
  },
  {
    title: "3. Crypto payments",
    body: "When you pay with cryptocurrency, the payment gateway processes the transaction. We store a transaction record (amount, currency, method) but never your private keys or wallet seed phrases. Crypto transactions are immutable — we cannot reverse them.",
  },
  {
    title: "4. Cookies & sessions",
    body: "We use HTTP-only session cookies for authentication. These cookies are not accessible to JavaScript and are sent only over HTTPS in production. We do not use third-party tracking cookies.",
  },
  {
    title: "5. Data retention",
    body: "We retain your account data while your account is active. Inactive listings may be archived after 12 months. You may request deletion of your account at any time by emailing support@carsnight.com — we will permanently delete your personal data within 30 days.",
  },
  {
    title: "6. Security",
    body: "We follow OWASP best practices: hashed passwords, parameterized database queries, input validation, rate limiting, and audit logging. Despite our best efforts, no system is 100% secure. If you discover a vulnerability, please email security@carsnight.com — we offer bug bounties for valid reports.",
  },
  {
    title: "7. Your rights (GDPR)",
    body: "You have the right to access, correct, export, and delete your personal data. You also have the right to restrict or object to processing. To exercise any of these rights, email support@carsnight.com from your registered email.",
  },
  {
    title: "8. Contact",
    body: "For any privacy questions or requests, contact our Data Protection Officer at support@carsnight.com.",
  },
];

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <h1 className="text-4xl font-bold tracking-tight">Privacy Policy</h1>
      <p className="mt-3 text-sm text-muted-foreground">Last updated: {new Date().getFullYear()}. This policy applies to all Cars Night users worldwide.</p>

      <div className="mt-10 space-y-8">
        {SECTIONS.map((s, i) => (
          <section key={i}>
            <h2 className="text-lg font-semibold">{s.title}</h2>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{s.body}</p>
          </section>
        ))}
      </div>

      <div className="mt-12 rounded-xl border bg-card p-6 text-sm text-muted-foreground">
        Cars Night is committed to protecting your privacy. This policy may be updated from time to time; we will notify registered users by email of any material changes.
      </div>
    </div>
  );
}
