export function getAssetUrl(path: string | null | undefined): string {
  if (!path) return "/default-avatar.png";
  if (path.startsWith("http")) return path;
  return path;
}
