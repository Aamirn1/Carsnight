"use client";

import { useState } from "react";
import { Save, Mail, Globe, Video, Megaphone, Type, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { isValidEmail } from "@/lib/constants";

interface Props {
  initial: Record<string, string>;
}

const FIELDS: {
  key: string;
  label: string;
  help?: string;
  placeholder: string;
  type?: "text" | "textarea" | "email" | "url";
  icon: React.ComponentType<{ className?: string }>;
  maxLength?: number;
}[] = [
  {
    key: "site_name",
    label: "Site name",
    placeholder: "Cars Night",
    type: "text",
    icon: Type,
    maxLength: 80,
    help: "Shown in the browser tab title and across the site.",
  },
  {
    key: "tagline",
    label: "Tagline",
    placeholder: "Your global car marketplace",
    type: "text",
    icon: Globe,
    maxLength: 120,
    help: "A short marketing line displayed on the home hero.",
  },
  {
    key: "contact_email",
    label: "Contact email",
    placeholder: "support@carsnight.com",
    type: "email",
    icon: Mail,
    maxLength: 120,
    help: "Public contact address shown in the footer and contact links.",
  },
  {
    key: "announcement",
    label: "Announcement banner",
    placeholder: "Free shipping on your first listing this week!",
    type: "textarea",
    icon: Megaphone,
    maxLength: 200,
    help: "Shown as a dismissible banner at the top of the site. Leave empty to hide.",
  },
  {
    key: "hero_video_url",
    label: "Hero video URL (optional)",
    placeholder: "https://www.youtube.com/watch?v=...",
    type: "url",
    icon: Video,
    maxLength: 300,
    help: "Optional. If provided, the home hero may embed this video.",
  },
];

export function SettingsForm({ initial }: Props) {
  const { toast } = useToast();
  const [values, setValues] = useState<Record<string, string>>(() => {
    const v: Record<string, string> = {};
    for (const f of FIELDS) v[f.key] = initial[f.key] ?? "";
    return v;
  });
  const [saving, setSaving] = useState(false);

  const dirty = FIELDS.some((f) => (values[f.key] ?? "") !== (initial[f.key] ?? ""));

  const handleChange = (k: string, v: string) => {
    setValues((prev) => ({ ...prev, [k]: v }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const contactEmail = values.contact_email?.trim() || "";
      if (contactEmail && !isValidEmail(contactEmail)) {
        throw new Error("Contact email is not a valid email address.");
      }
      const heroUrl = values.hero_video_url?.trim() || "";
      if (heroUrl) {
        try {
          // Basic URL sanity check
          void new URL(heroUrl);
        } catch {
          throw new Error("Hero video URL is not a valid URL.");
        }
      }

      const body: Record<string, string> = {};
      for (const f of FIELDS) {
        body[f.key] = (values[f.key] ?? "").slice(0, f.maxLength ?? 500);
      }

      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) throw new Error(data?.error || "Failed to save settings.");

      toast({
        title: "Settings saved",
        description: "Changes apply immediately across the site.",
      });
      // After successful save, update "initial" baseline so dirty flag resets.
      for (const f of FIELDS) {
        initial[f.key] = body[f.key];
      }
      setValues((prev) => ({ ...prev }));
    } catch (err: any) {
      toast({
        title: "Could not save settings",
        description: err?.message || "Something went wrong.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card className="border-border/70 shadow-sm">
        <CardHeader>
          <CardTitle>General</CardTitle>
          <CardDescription>
            Site-wide configuration shown to all visitors.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {FIELDS.map((f, idx) => {
            const Icon = f.icon;
            const value = values[f.key] ?? "";
            return (
              <div key={f.key} className="space-y-1.5">
                <Label htmlFor={f.key} className="flex items-center gap-2 text-sm font-medium">
                  <Icon className="h-3.5 w-3.5 text-primary" />
                  {f.label}
                  {f.maxLength && (
                    <span className="ml-auto text-xs text-muted-foreground tabular-nums">
                      {value.length}/{f.maxLength}
                    </span>
                  )}
                </Label>
                {f.type === "textarea" ? (
                  <Textarea
                    id={f.key}
                    value={value}
                    onChange={(e) => handleChange(f.key, e.target.value.slice(0, f.maxLength ?? 500))}
                    placeholder={f.placeholder}
                    rows={3}
                  />
                ) : (
                  <Input
                    id={f.key}
                    type={f.type === "email" ? "email" : f.type === "url" ? "url" : "text"}
                    value={value}
                    onChange={(e) => handleChange(f.key, e.target.value.slice(0, f.maxLength ?? 500))}
                    placeholder={f.placeholder}
                  />
                )}
                {f.help && <p className="text-xs text-muted-foreground">{f.help}</p>}
                {idx < FIELDS.length - 1 && <Separator className="mt-2" />}
              </div>
            );
          })}
        </CardContent>
      </Card>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted-foreground">
          Changes apply immediately across the site.
        </p>
        <Button
          onClick={handleSave}
          disabled={!dirty || saving}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Saving…
            </>
          ) : (
            <>
              <Save className="h-4 w-4" /> Save changes
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
