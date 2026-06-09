import Image from "next/image";
import Link from "next/link";
import { site } from "@/config/site";

type LogoVariant = "masthead" | "header" | "mark" | "about" | "footer";

const variantClasses: Record<LogoVariant, string> = {
  masthead: "h-auto w-full max-w-[200px] sm:max-w-[240px] md:max-w-[280px]",
  header: "h-auto w-full max-w-[168px] opacity-95 sm:max-w-[190px]",
  mark: "h-auto w-full max-w-[56px] opacity-80",
  about: "h-auto w-full max-w-[200px] opacity-90",
  footer: "h-auto w-full max-w-[200px] sm:max-w-[240px] opacity-95",
};

interface SiteLogoProps {
  variant?: LogoVariant;
  priority?: boolean;
  linked?: boolean;
}

export function SiteLogo({
  variant = "header",
  priority = false,
  linked = false,
}: SiteLogoProps) {
  const { src, alt, width, height } = site.logo;

  const image = (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      priority={priority}
      loading={priority ? "eager" : "lazy"}
      className={`${variantClasses[variant]} masthead-logo-image`}
    />
  );

  if (linked) {
    return (
      <Link href="/" className="group inline-block">
        {image}
        <span className="sr-only">{site.name}</span>
      </Link>
    );
  }

  return image;
}
