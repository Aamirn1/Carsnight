"use client";

import { useEffect, useRef, useState } from "react";

interface TypewriterProps {
  phrases: string[];
  typingSpeed?: number; // ms per char
  deletingSpeed?: number;
  pauseEnd?: number; // pause at end of phrase
  pauseStart?: number; // pause before deleting
  className?: string;
}

/**
 * SEO-friendly typewriter: renders the *current* phrase visibly while keeping
 * the *full* set of phrases in a visually-hidden (screen-reader-friendly) span
 * so crawlers and assistive tech see the full text content.
 */
export function Typewriter({
  phrases,
  typingSpeed = 65,
  deletingSpeed = 35,
  pauseEnd = 1600,
  pauseStart = 500,
  className = "",
}: TypewriterProps) {
  const [index, setIndex] = useState(0); // phrase index
  const [sub, setSub] = useState(0); // substring length
  const [deleting, setDeleting] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const phrase = phrases[index % phrases.length] ?? "";
    if (!deleting && sub === phrase.length) {
      // pause at full phrase, then start deleting
      timer.current = setTimeout(() => setDeleting(true), pauseEnd);
      return () => timer.current && clearTimeout(timer.current);
    }
    if (deleting && sub === 0) {
      // move to next phrase after a short pause (deferred setState avoids
      // synchronous setState-in-effect cascades)
      timer.current = setTimeout(() => {
        setDeleting(false);
        setIndex((i) => (i + 1) % phrases.length);
      }, pauseStart);
      return () => timer.current && clearTimeout(timer.current);
    }
    const delay = deleting ? deletingSpeed : typingSpeed;
    timer.current = setTimeout(() => {
      setSub((s) => (deleting ? Math.max(0, s - 1) : Math.min(phrase.length, s + 1)));
    }, delay);
    return () => timer.current && clearTimeout(timer.current);
  }, [sub, deleting, index, phrases, typingSpeed, deletingSpeed, pauseEnd, pauseStart]);

  const current = phrases[index % phrases.length] ?? "";

  return (
    <span className={className} aria-label={phrases.join(", ")}>
      {/* Visible animated text */}
      <span aria-hidden="true">{current.slice(0, sub)}</span>
      <span aria-hidden="true" className="typewriter-caret" />
      {/* Hidden full text for SEO & screen readers */}
      <span className="sr-only">{phrases.join(". ")}.</span>
    </span>
  );
}
