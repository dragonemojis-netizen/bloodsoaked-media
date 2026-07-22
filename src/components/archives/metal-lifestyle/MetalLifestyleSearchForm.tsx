"use client";

import { useRouter } from "next/navigation";
import { METAL_LIFESTYLE_BASE } from "@/config/metal-lifestyle";

interface Props {
  initialQuery?: string;
  authors: string[];
  categories: string[];
  years: string[];
  initialAuthor?: string;
  initialCategory?: string;
  initialYear?: string;
}

export function MetalLifestyleSearchForm({
  initialQuery = "",
  authors,
  categories,
  years,
  initialAuthor = "",
  initialCategory = "",
  initialYear = "",
}: Props) {
  const router = useRouter();

  return (
    <form
      className="ml-search-form"
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        const params = new URLSearchParams();
        const q = String(fd.get("q") || "").trim();
        const author = String(fd.get("author") || "").trim();
        const category = String(fd.get("category") || "").trim();
        const year = String(fd.get("year") || "").trim();
        if (q) params.set("q", q);
        if (author) params.set("author", author);
        if (category) params.set("category", category);
        if (year) params.set("year", year);
        const qs = params.toString();
        router.push(
          `${METAL_LIFESTYLE_BASE}/search${qs ? `?${qs}` : ""}`,
        );
      }}
    >
      <label className="ml-search-label">
        Search titles, authors, categories
        <input
          name="q"
          type="search"
          defaultValue={initialQuery}
          className="ml-search-input"
          placeholder="e.g. Boundaries, Alex Brown, 2017"
        />
      </label>
      <div className="ml-search-filters">
        <label>
          Author
          <select name="author" defaultValue={initialAuthor}>
            <option value="">Any</option>
            {authors.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </label>
        <label>
          Category
          <select name="category" defaultValue={initialCategory}>
            <option value="">Any</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <label>
          Year
          <select name="year" defaultValue={initialYear}>
            <option value="">Any</option>
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </label>
      </div>
      <button type="submit" className="ml-search-submit">
        Search archive
      </button>
    </form>
  );
}
