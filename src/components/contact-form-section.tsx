"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Mail, Send, Loader2, MapPin, Twitter, Instagram, Linkedin } from "lucide-react";

const TOPICS = [
  { id: "general", label: "General question" },
  { id: "support", label: "Listing / account support" },
  { id: "payments", label: "Payment / crypto" },
  { id: "partnership", label: "Partnership / press" },
];

export function ContactFormSection() {
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
    await new Promise((r) => setTimeout(r, 700));
    setSending(false);
    setName(""); setEmail(""); setTopic("general"); setMessage("");
    toast({ title: "Message sent!", description: "We'll reply within 1 business day." });
  };

  return (
    <section className="py-14 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Contact heading */}
        <div className="text-center mb-10">
          <Badge variant="outline" className="mb-3 text-primary border-primary/30"><Mail className="h-3 w-3 mr-1" /> Contact</Badge>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Get in touch</h2>
          <p className="mt-2 text-sm text-muted-foreground max-w-xl mx-auto">
            Questions, feedback, or partnership ideas? We typically reply within one business day.
          </p>
        </div>

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
                    <Label htmlFor="home-name">Your name <span className="text-destructive">*</span></Label>
                    <Input id="home-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" required />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="home-email">Your email <span className="text-destructive">*</span></Label>
                    <Input id="home-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jane@example.com" required />
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
                  <Label htmlFor="home-message">Message <span className="text-destructive">*</span></Label>
                  <Textarea
                    id="home-message"
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
  );
}
