"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Mail, MessageSquare, MapPin, Send, Loader2, Phone, Clock, Twitter, Instagram, Linkedin } from "lucide-react";

const TOPICS = [
  { id: "general", label: "General question" },
  { id: "support", label: "Listing / account support" },
  { id: "payments", label: "Payment / crypto" },
  { id: "partnership", label: "Partnership / press" },
];

export function ContactForm() {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [topic, setTopic] = useState("general");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) {
      toast({ title: "Please fill in all required fields", variant: "destructive" });
      return;
    }
    setSending(true);
    // Demo: pretend to send. In production, this would POST to /api/contact.
    await new Promise((r) => setTimeout(r, 700));
    setSending(false);
    setName(""); setEmail(""); setTopic("general"); setMessage("");
    toast({ title: "Message sent!", description: "We'll reply within 1 business day." });
  };

  return (
    <div className="flex flex-col">
      {/* Hero — dark background with the hero cars image, no white bleed */}
      <section className="relative overflow-hidden bg-foreground">
        <div className="absolute inset-0">
          <Image src="/hero-cars.png" alt="" fill priority sizes="100vw" className="object-cover opacity-30" />
        </div>
        <div className="absolute inset-0 bg-foreground/80" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20 text-white">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-md border border-white/25 px-3.5 py-1.5 text-xs sm:text-sm font-medium">
            <Mail className="h-3.5 w-3.5 icon-neon" /> Contact Cars Night
          </div>
          <h1 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] max-w-3xl">
            Let&apos;s talk.
            <span className="block gradient-text">We&apos;re here to help.</span>
          </h1>
          <p className="mt-5 text-base sm:text-lg text-white/80 max-w-2xl">
            Questions, feedback, partnership ideas, or just want to say hi? We typically reply within one business day.
          </p>
        </div>
      </section>

      {/* Contact info cards */}
      <section className="py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-border/70 shadow-sm">
              <CardHeader className="pb-3">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Mail className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <h3 className="text-sm font-semibold">Email</h3>
                <p className="mt-1 text-sm text-muted-foreground">support@carsnight.com</p>
                <p className="mt-0.5 text-xs text-muted-foreground">Best for detailed questions</p>
              </CardContent>
            </Card>
            <Card className="border-border/70 shadow-sm">
              <CardHeader className="pb-3">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <MessageSquare className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <h3 className="text-sm font-semibold">Live chat</h3>
                <p className="mt-1 text-sm text-muted-foreground">Mon–Fri, 9am–6pm UTC</p>
                <p className="mt-0.5 text-xs text-muted-foreground">Look for the bubble bottom-right</p>
              </CardContent>
            </Card>
            <Card className="border-border/70 shadow-sm">
              <CardHeader className="pb-3">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Phone className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <h3 className="text-sm font-semibold">Phone</h3>
                <p className="mt-1 text-sm text-muted-foreground">+1 (555) 016-2026</p>
                <p className="mt-0.5 text-xs text-muted-foreground">For urgent payment issues</p>
              </CardContent>
            </Card>
            <Card className="border-border/70 shadow-sm">
              <CardHeader className="pb-3">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Clock className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <h3 className="text-sm font-semibold">Response time</h3>
                <p className="mt-1 text-sm text-muted-foreground">&lt; 1 business day</p>
                <p className="mt-0.5 text-xs text-muted-foreground">Faster on weekdays</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Form + sidebar */}
      <section className="pb-16 sm:pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Form */}
            <Card className="lg:col-span-2 border-border/70 shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl">Send us a message</CardTitle>
                <p className="text-sm text-muted-foreground">Fill in the form and we&apos;ll get back to you shortly.</p>
              </CardHeader>
              <CardContent>
                <form onSubmit={submit} className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="name">Your name <span className="text-destructive">*</span></Label>
                      <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" required />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="email">Your email <span className="text-destructive">*</span></Label>
                      <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jane@example.com" required />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label>What&apos;s this about?</Label>
                    <div className="flex flex-wrap gap-2">
                      {TOPICS.map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setTopic(t.id)}
                          className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors ${
                            topic === t.id
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border text-muted-foreground hover:text-foreground hover:bg-muted"
                          }`}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="message">Message <span className="text-destructive">*</span></Label>
                    <Textarea
                      id="message"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={6}
                      placeholder="How can we help?"
                      required
                    />
                  </div>
                  <Button type="submit" disabled={sending} className="btn-gold">
                    {sending ? <><Loader2 className="h-4 w-4 mr-1 animate-spin" /> Sending...</> : <><Send className="h-4 w-4 mr-1" /> Send message</>}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Sidebar: HQ + social */}
            <div className="space-y-6">
              <Card className="border-border/70 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" /> Headquarters</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  <p>Remote-first team</p>
                  <p className="mt-1">Operating across</p>
                  <p className="mt-1 font-medium text-foreground">North America · Europe · South Asia</p>
                </CardContent>
              </Card>
              <Card className="border-border/70 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base">Follow Cars Night</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <a href="https://twitter.com/carsnight" target="_blank" rel="noopener noreferrer" aria-label="Twitter"
                      className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border hover:border-primary hover:bg-primary/10 hover:text-primary transition-colors">
                      <Twitter className="h-4 w-4" />
                    </a>
                    <a href="https://instagram.com/carsnight" target="_blank" rel="noopener noreferrer" aria-label="Instagram"
                      className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border hover:border-primary hover:bg-primary/10 hover:text-primary transition-colors">
                      <Instagram className="h-4 w-4" />
                    </a>
                    <a href="https://linkedin.com/company/carsnight" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"
                      className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border hover:border-primary hover:bg-primary/10 hover:text-primary transition-colors">
                      <Linkedin className="h-4 w-4" />
                    </a>
                  </div>
                  <p className="mt-4 text-xs text-muted-foreground">
                    Daily car content, marketplace updates, and behind-the-scenes from the Cars Night team.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-primary/30 bg-primary/5">
                <CardContent className="pt-6">
                  <p className="text-sm text-foreground">
                    <strong>Need to report a listing?</strong>
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Email <a href="mailto:abuse@carsnight.com" className="text-primary hover:underline">abuse@carsnight.com</a> with the listing URL and we&apos;ll review within 24 hours.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
