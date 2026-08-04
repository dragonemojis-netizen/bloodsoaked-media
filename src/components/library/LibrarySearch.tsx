"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { libraryVoice } from "@/config/library-voice";

interface LibrarySearchProps {
  className?: string;
}

/**
 * Catalog Lookup — archival terminal nested in the facet rail.
 * Preserves active platform / genre facets; clears the shelf page.
 */
export function LibrarySearch({ className = "" }: LibrarySearchProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlQuery = searchParams.get("q") ?? "";
  const [query, setQuery] = useState(urlQuery);

  useEffect(() => {
    setQuery(urlQuery);
  }, [urlQuery]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = query.trim();
    const params = new URLSearchParams(searchParams.toString());

    if (trimmed) {
      params.set("q", trimmed);
    } else {
      params.delete("q");
    }
    params.delete("page");

    const qs = params.toString();
    router.push(qs ? `/library?${qs}` : "/library", { scroll: false });
  }

  return (
    <form
      onSubmit={handleSubmit}
      role="search"
      className={`library-search ${className}`}
    >
      <p className="font-mono text-[0.54rem] uppercase tracking-[0.3em] text-foreground-muted/70">
        {libraryVoice.lookup.eyebrow}
      </p>

      <label htmlFor="library-search" className="sr-only">
        {libraryVoice.lookup.label}
      </label>

      <div className="library-search-terminal mt-3 flex items-stretch">
        <input
          id="library-search"
          name="q"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={libraryVoice.lookup.placeholder}
          className="library-search-input min-w-0 flex-1 bg-transparent px-3 py-2.5 font-mono text-sm tracking-[0.03em] text-foreground placeholder:text-foreground-muted/45"
          autoComplete="off"
          spellCheck={false}
        />
        <button
          type="submit"
          className="library-search-submit shrink-0 px-3 font-mono text-[0.52rem] uppercase tracking-[0.2em] text-foreground-muted"
        >
          {libraryVoice.lookup.submit}
        </button>
      </div>
    </form>
  );
}
