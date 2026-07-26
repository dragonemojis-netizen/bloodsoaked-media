import Link from "next/link";
import { AuthorityIndex } from "@/components/library/AuthorityIndex";
import { authorityVoice } from "@/config/authority-voice";
import { getPublishedAuthorityEntries } from "@/lib/authority";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: authorityVoice.indexTitle,
  description: authorityVoice.description,
};

export default function AuthorityFilePage() {
  const entries = getPublishedAuthorityEntries();

  return (
    <div className="library-world archive-world relative mx-auto max-w-3xl px-6 py-14 md:px-10 md:py-16 lg:py-20">
      <Link href="/library" className="library-detail-back library-field-link">
        {authorityVoice.backToLibrary}
      </Link>

      <header className="authority-file-header mt-10">
        <p className="authority-record-eyebrow">{authorityVoice.eyebrow}</p>
        <h1 className="authority-file-title mt-3 font-serif text-[2rem] leading-tight tracking-[0.01em] text-foreground md:text-[2.35rem]">
          {authorityVoice.indexTitle}
        </h1>
        <p className="mt-4 max-w-xl font-serif text-base leading-relaxed text-foreground-muted">
          {authorityVoice.indexLead}
        </p>
      </header>

      <div className="mt-12">
        <AuthorityIndex entries={entries} />
      </div>
    </div>
  );
}
