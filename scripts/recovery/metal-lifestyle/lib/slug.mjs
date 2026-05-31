export function slugifyMetalLifestyle(title, url) {
  const fromUrl = url
    .replace(/^https?:\/\/[^/]+/i, "")
    .replace(/^\//, "")
    .split("/")
    .pop()
    ?.replace(/\.html$/i, "");

  const base =
    fromUrl && fromUrl.length > 3
      ? fromUrl
      : title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "")
          .slice(0, 80);

  const slug = `metal-lifestyle-${base}`.replace(/-+/g, "-");
  return slug.slice(0, 96);
}
