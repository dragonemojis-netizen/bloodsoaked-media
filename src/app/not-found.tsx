import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-lg px-6 py-24 text-center">
      <p className="font-mono text-[0.65rem] uppercase tracking-[0.35em] text-accent-bright">
        404
      </p>
      <h1 className="mt-4 font-serif text-3xl text-foreground">
        Tape not found
      </h1>
      <p className="mt-4 text-foreground-muted">
        This page is not in the catalog. It may have been shelved elsewhere—or
        never existed.
      </p>
      <Link
        href="/"
        className="mt-8 inline-block border border-accent px-5 py-2 font-mono text-[0.7rem] uppercase tracking-[0.15em] text-foreground transition-colors hover:bg-accent hover:text-white"
      >
        Return home
      </Link>
    </div>
  );
}
