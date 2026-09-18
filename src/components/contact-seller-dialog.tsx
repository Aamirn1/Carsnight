"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Mail, Send } from "lucide-react";

interface Props {
  sellerName: string;
  listingTitle: string;
  /** Optional className override for the trigger button. */
  triggerClassName?: string;
}

/**
 * "Contact seller" button that opens a dialog with a simple form
 * (name / email / message). On submit, it shows a success toast and closes.
 * Demo only — no backend request is made.
 */
export function ContactSellerDialog({ sellerName, listingTitle, triggerClassName }: Props) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const { toast } = useToast();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast({
        variant: "destructive",
        title: "Please fill in all fields",
        description: "Your name, email, and a message are required.",
      });
      return;
    }
    toast({
      title: "Message sent to seller",
      description: `We'll let ${sellerName} know about your interest in "${listingTitle}".`,
    });
    setName("");
    setEmail("");
    setMessage("");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          className={
            triggerClassName
              ? triggerClassName
              : "w-full bg-primary text-primary-foreground hover:bg-primary/90"
          }
        >
          <Mail className="h-4 w-4 mr-1.5" /> Contact seller
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Contact {sellerName}</DialogTitle>
          <DialogDescription>
            Send a message about <span className="font-medium text-foreground">&ldquo;{listingTitle}&rdquo;</span>.
            The seller will be notified by email.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="contact-name">Your name</Label>
            <Input
              id="contact-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              autoComplete="name"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="contact-email">Your email</Label>
            <Input
              id="contact-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="john@example.com"
              autoComplete="email"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="contact-message">Message</Label>
            <Textarea
              id="contact-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              placeholder={`Hi, I'm interested in "${listingTitle}" and would like more details...`}
              required
            />
          </div>
          <DialogFooter>
            <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Send className="h-4 w-4 mr-1.5" /> Send message
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
