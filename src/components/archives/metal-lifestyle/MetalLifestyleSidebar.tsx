import Link from "next/link";
import { metalLifestyleSidebar } from "@/config/metal-lifestyle";
import { METAL_LIFESTYLE_BASE } from "@/config/metal-lifestyle";
import { getMetalLifestyleCategories } from "@/lib/metal-lifestyle-archive";

export function MetalLifestyleSidebar() {
  const categories = getMetalLifestyleCategories();

  return (
    <aside className="ml-blog-sidebar">
      <h2 className="ml-blog-author-title">{metalLifestyleSidebar.title}</h2>
      <div className="ml-sidebar-blurb">
        {metalLifestyleSidebar.blurb.map((line) => (
          <p key={line}>{line}</p>
        ))}
        <p>
          <strong>Categories:</strong>
        </p>
        {categories.length > 0 ? (
          <ul className="ml-sidebar-categories">
            {categories.map((cat) => (
              <li key={cat.slug}>
                <Link href={`${METAL_LIFESTYLE_BASE}/category/${cat.slug}`}>
                  {cat.name}
                </Link>
                <span className="ml-sidebar-count"> ({cat.articleCount})</span>
              </li>
            ))}
          </ul>
        ) : (
          <p>{metalLifestyleSidebar.categories}</p>
        )}
      </div>
      <ul className="ml-social" aria-label="Metal Lifestyle social links">
        {metalLifestyleSidebar.social.map((item) => (
          <li key={item.label}>
            <a href={item.href} target="_blank" rel="noopener noreferrer">
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </aside>
  );
}
