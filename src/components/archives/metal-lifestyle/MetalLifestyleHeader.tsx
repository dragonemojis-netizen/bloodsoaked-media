import Link from "next/link";
import {
  METAL_LIFESTYLE_BASE,
  metalLifestyleNav,
} from "@/config/metal-lifestyle";

interface MetalLifestyleHeaderProps {
  activeHref?: string;
}

function isNavItemActive(itemHref: string, activeHref: string): boolean {
  if (itemHref === `${METAL_LIFESTYLE_BASE}/blog`) {
    return (
      activeHref === `${METAL_LIFESTYLE_BASE}/blog` ||
      activeHref.startsWith(`${METAL_LIFESTYLE_BASE}/post/`)
    );
  }
  return activeHref === itemHref || activeHref.startsWith(`${itemHref}/`);
}

export function MetalLifestyleHeader({
  activeHref = METAL_LIFESTYLE_BASE,
}: MetalLifestyleHeaderProps) {
  return (
    <header className="ml-header">
      <div className="ml-sitename">
        <Link href={METAL_LIFESTYLE_BASE} className="ml-logo">
          Metal Lifestyle
        </Link>
      </div>
      <nav className="ml-navigation" aria-label="Metal Lifestyle">
        <ul>
          {metalLifestyleNav.map((item) => (
            <li
              key={item.href}
              className={
                isNavItemActive(item.href, activeHref)
                  ? "ml-nav-active"
                  : undefined
              }
            >
              <Link href={item.href}>{item.label}</Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
