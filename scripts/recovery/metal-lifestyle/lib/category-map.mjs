/** Map Metal Lifestyle topics to Bloodsoaked archive taxonomy. */

const HORROR_KEYWORDS =
  /\b(horror|vhs|zombie|slasher|cult|fear|curtains|thing|body snatch|silent hill|resident evil)\b/i;

export function inferArchiveFields({ title, text, weeblyCategory }) {
  const combined = `${title} ${text}`.toLowerCase();
  let category = "culture";
  let type = "essay";
  let medium = "culture";

  const cat = (weeblyCategory ?? "").toLowerCase();

  if (cat.includes("game") || /\b(game|gaming|kingdom hearts|playstation|nintendo|jrpg|retro)\b/i.test(combined)) {
    category = "games";
    type = combined.includes("review") || /^review:/i.test(title) ? "review" : "essay";
    medium = "game";
  } else if (cat.includes("metal") || cat.includes("music") || /\b(album|ep|lp|single|metalcore|hardcore|band|record)\b/i.test(combined)) {
    category = "music";
    type = /^review:|single review:/i.test(title) ? "review" : "essay";
    medium = "music";
  } else if (/\b(film|movie|cinema|screen)\b/i.test(combined)) {
    category = "film";
    type = "review";
    medium = "film";
  } else if (/\b(tv|television|series|show)\b/i.test(combined)) {
    category = "television";
    type = "review";
    medium = "television";
  } else if (cat.includes("opinion") || cat.includes("personal")) {
    category = "culture";
    type = "editorial";
    medium = "culture";
  } else if (/^review:/i.test(title) || /single review:/i.test(title)) {
    category = "music";
    type = "review";
    medium = "music";
  }

  if (HORROR_KEYWORDS.test(combined)) {
    if (category === "culture") category = "film";
  }

  if (/\bretrospective\b/i.test(title)) type = "retrospective";

  const collectionTags = ["the-archives", "metal-lifestyle-era"];
  if (type === "review") collectionTags.push("reviews");
  if (type === "essay" || type === "editorial") collectionTags.push("essays");
  if (HORROR_KEYWORDS.test(combined)) collectionTags.push("horror");

  const tags = ["metal lifestyle", "legacy", category];
  if (weeblyCategory) tags.push(weeblyCategory.toLowerCase());

  return {
    category,
    type,
    medium,
    collections: [...new Set(collectionTags)],
    tags: [...new Set(tags)],
  };
}
