import Link from "next/link";
import { getNavLinks, site } from "@/config/site";
import { SiteLogo } from "./SiteLogo";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="publication-footer relative mt-auto border-t border-border">
      <div className="mx-auto max-w-6xl px-6 py-10 md:py-12">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm">
            <SiteLogo variant="footer" linked priority={false} />
            <p className="site-footer-descriptor mt-4 font-mono text-meta uppercase tracking-[0.12em] text-foreground-muted">
              {site.descriptor}
            </p>
          </div>

          <nav aria-label="Footer navigation" className="site-footer-nav">
            <ul className="flex flex-col gap-2.5 font-mono text-nav uppercase tracking-[0.12em] text-foreground-muted">
              {getNavLinks().map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="transition-colors hover:text-accent-bright"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/feed.xml"
                  className="transition-colors hover:text-accent-bright"
                >
                  RSS Feed
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        <div className="site-footer-closing mt-10 border-t border-border-subtle pt-8">
          <p className="font-serif text-lg text-foreground">
            Be Kind. Rewind. Return to the Shelf.
          </p>
          <p className="mt-3 font-mono text-footer-meta text-foreground-muted">
            © {year} {site.name} · {site.curatorLine}
          </p>
        </div>
      </div>
    </footer>
  );
}
