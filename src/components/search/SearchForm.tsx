"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";

export function SearchForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = query.trim();
    if (trimmed) {
      router.push(`/search?q=${encodeURIComponent(trimmed)}`);
    } else {
      router.push("/search");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 sm:flex-row">
      <label htmlFor="search" className="sr-only">
        Search the catalog
      </label>
      <input
        id="search"
        name="q"
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search titles, tags, categories…"
        className="flex-1 border border-border bg-background-panel px-4 py-3 font-mono text-sm text-foreground placeholder:text-foreground-muted/60 focus:border-accent"
        autoComplete="off"
      />
      <button
        type="submit"
        className="border border-accent bg-accent/20 px-6 py-3 font-mono text-[0.7rem] uppercase tracking-[0.2em] text-foreground transition-colors hover:bg-accent hover:text-white"
      >
        Search
      </button>
    </form>
  );
}
