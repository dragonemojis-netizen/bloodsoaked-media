import Link from "next/link";
import { workbenchVoice } from "@/config/workbench-voice";
import type { WorkbenchSearchResult } from "@/lib/workbench";

interface WorkbenchSearchProps {
  query: string;
  results: WorkbenchSearchResult[];
}

export function WorkbenchSearch({ query, results }: WorkbenchSearchProps) {
  return (
    <section className="workbench-section" aria-labelledby="workbench-lookup">
      <h2 id="workbench-lookup" className="workbench-section-title">
        {workbenchVoice.search.title}
      </h2>
      <p className="workbench-section-note">{workbenchVoice.search.hint}</p>

      <form className="workbench-search" action="/workbench" method="get">
        <label className="sr-only" htmlFor="workbench-q">
          {workbenchVoice.search.title}
        </label>
        <input
          id="workbench-q"
          name="q"
          type="search"
          defaultValue={query}
          placeholder={workbenchVoice.search.placeholder}
          className="workbench-search-input"
          autoComplete="off"
        />
        <button type="submit" className="workbench-action">
          {workbenchVoice.search.submit}
        </button>
      </form>

      {query ? (
        results.length === 0 ? (
          <p className="workbench-empty">{workbenchVoice.search.empty}</p>
        ) : (
          <ul className="workbench-list workbench-list--compact">
            {results.map((result) => (
              <li key={`${result.kind}-${result.id}`} className="workbench-list-item">
                <div className="workbench-list-main">
                  <Link href={result.href} className="workbench-list-title">
                    {result.title}
                  </Link>
                  <p className="workbench-list-sub">
                    <span className={`workbench-lane workbench-lane--${result.lane}`}>
                      {workbenchVoice.lanes[result.lane]}
                    </span>
                    {" · "}
                    {result.meta}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )
      ) : null}
    </section>
  );
}
