import { redirect } from "next/navigation";
import { METAL_LIFESTYLE_BASE } from "@/config/metal-lifestyle";

interface Props {
  params: Promise<{ section: string }>;
}

/** Legacy section URLs → restored page routes */
export default async function MetalLifestyleSectionRedirect({ params }: Props) {
  const { section } = await params;
  const map: Record<string, string> = {
    dysphoria: "dysphoria",
    "american-metalcore-project": "american-metalcore-project",
    "prisms-local-show-recap": "prisms-local-show-recap",
    "fear-short-horror-tales-from-the-team":
      "fear-short-horror-tales-from-the-team",
    "curtains-movie-tv-reviews": "curtains-movie--tv-reviews",
    "about-us-meet-the-staff": "about-us-meet-the-staff",
    "gaming-corner": "gaming-corner",
    gallery: "gallery",
  };
  const target = map[section] ?? section;
  redirect(`${METAL_LIFESTYLE_BASE}/page/${target}`);
}
