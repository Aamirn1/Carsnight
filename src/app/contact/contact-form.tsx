"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Mail, MessageSquare, MapPin, Send, Loader2 } from "lucide-react";

export function ContactForm() {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) {
      toast({ title: "Please fill in all fields", variant: "destructive" });
      return;
    }
    setSending(true);
    // Demo: pretend to send. In production, this would POST to /api/contact.
    await new Promise((r) => setTimeout(r, 700));
    setSending(false);
    setName(""); setEmail(""); setMessage("");
    toast({ title: "Message sent!", description: "We'll reply within 1 business day." });
  };

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <div className="text-center">
        <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 border border-primary/20 px-3 py-1 text-xs font-medium text-primary">
          <Mail className="h-3.5 w-3.5" /> Contact Us
        </span>
        <h1 className="mt-4 text-4xl font-bold tracking-tight">Get in touch</h1>
        <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
          Questions, feedback, or partnership ideas? We typically reply within one business day.
        </p>
      </div>

      <div className="mt-10 grid md:grid-cols-3 gap-6">
        <div className="space-y-4">
          <Card><CardHeader><CardTitle className="text-sm flex items-center gap-2"><Mail className="h-4 w-4 text-primary" /> Email</CardTitle></CardHeader><CardContent className="text-sm text-muted-foreground">support@carsnight.com</CardContent></Card>
          <Card><CardHeader><CardTitle className="text-sm flex items-center gap-2"><MessageSquare className="h-4 w-4 text-primary" /> Live chat</CardTitle></CardHeader><CardContent className="text-sm text-muted-foreground">Mon–Fri, 9am–6pm UTC</CardContent></Card>
          <Card><CardHeader><CardTitle className="text-sm flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" /> Headquarters</CardTitle></CardHeader><CardContent className="text-sm text-muted-foreground">Remote-first · Worldwide</CardContent></Card>
        </div>

        <Card className="md:col-span-2">
          <CardHeader><CardTitle>Send us a message</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={submit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="name">Your name</Label>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="email">Your email</Label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jane@example.com" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="message">Message</Label>
                <Textarea id="message" value={message} onChange={(e) => setMessage(e.target.value)} rows={5} placeholder="How can we help?" />
              </div>
              <Button type="submit" disabled={sending} className="bg-primary text-primary-foreground hover:bg-primary/90">
                {sending ? <><Loader2 className="h-4 w-4 mr-1 animate-spin" /> Sending...</> : <><Send className="h-4 w-4 mr-1" /> Send message</>}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
