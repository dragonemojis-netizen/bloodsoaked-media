import Link from "next/link";
import { KnifeMotif } from "@/components/brand/KnifeMotif";
import { PublicationMasthead } from "@/components/brand/PublicationMasthead";
import { getNavLinks } from "@/config/site";

export function SiteHeader() {
  const navLinks = getNavLinks();
  return (
    <header className="site-masthead relative border-b border-border bg-background/95 backdrop-blur-sm">
      <div className="masthead-blood-rule" aria-hidden="true" />
      <KnifeMotif corner="br" className="!h-6 !w-4 !opacity-[0.12]" />

      <div className="relative z-10 mx-auto max-w-6xl px-6 py-5 md:py-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <PublicationMasthead />

          <nav aria-label="Main navigation" className="lg:pb-1">
            <ul className="site-nav flex flex-wrap gap-x-5 gap-y-2 font-mono text-nav uppercase tracking-[0.12em]">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-foreground-muted transition-colors hover:text-accent-bright"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
}
