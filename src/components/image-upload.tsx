"use client";

import { useState, useRef, ChangeEvent } from "react";
import Image from "next/image";
import { UploadCloud, X, Loader2, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Props {
  images: string[];
  onChange: (urls: string[]) => void;
  max?: number;
}

export function ImageUpload({ images, onChange, max = 5 }: Props) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const onFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setError(null);
    const remaining = max - images.length;
    if (remaining <= 0) {
      setError(`You can upload a maximum of ${max} images.`);
      return;
    }
    const toUpload = Array.from(files).slice(0, remaining);
    setUploading(true);
    try {
      const uploaded: string[] = [];
      for (const file of toUpload) {
        const form = new FormData();
        form.append("file", file);
        const res = await fetch("/api/upload", { method: "POST", body: form });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || "Upload failed");
        }
        const data = await res.json();
        uploaded.push(data.url);
      }
      onChange([...images, ...uploaded]);
    } catch (e: any) {
      setError(e.message || "Upload failed. Please try again.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const removeImage = (i: number) => {
    onChange(images.filter((_, idx) => idx !== i));
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {images.map((url, i) => (
          <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-border bg-muted group">
            <Image src={url} alt={`Listing image ${i + 1}`} fill sizes="200px" className="object-cover" />
            <button
              type="button"
              onClick={() => removeImage(i)}
              className="absolute top-1 right-1 rounded-full bg-background/90 text-foreground hover:bg-destructive hover:text-white p-1 shadow-md transition-colors"
              aria-label="Remove image"
            >
              <X className="h-3.5 w-3.5" />
            </button>
            {i === 0 && (
              <div className="absolute bottom-0 inset-x-0 bg-primary text-primary-foreground text-[10px] font-medium px-1 py-0.5 text-center">
                Cover
              </div>
            )}
          </div>
        ))}
        {images.length < max && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className={cn(
              "aspect-square rounded-lg border-2 border-dashed border-border hover:border-primary hover:bg-primary/5 transition-colors flex flex-col items-center justify-center text-muted-foreground p-4",
              uploading && "opacity-60",
            )}
          >
            {uploading ? <Loader2 className="h-5 w-5 animate-spin text-primary" /> : <UploadCloud className="h-5 w-5" />}
            <span className="mt-1 text-xs">{uploading ? "Uploading..." : "Add photo"}</span>
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="sr-only"
        onChange={(e: ChangeEvent<HTMLInputElement>) => onFiles(e.target.files)}
      />
      <p className="text-xs text-muted-foreground">
        <ImageIcon className="inline h-3 w-3 mr-1" />
        Upload up to {max} photos (JPEG, PNG, WEBP, max 5MB each). The first photo will be the cover image.
      </p>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
