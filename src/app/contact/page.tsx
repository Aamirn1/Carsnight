import type { Metadata } from "next";
import { ContactForm } from "./contact-form";

export const metadata: Metadata = {
  title: "Contact Cars Night",
  description: "Reach the Cars Night team — support, partnerships, and feedback. We reply within one business day.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return <ContactForm />;
}
