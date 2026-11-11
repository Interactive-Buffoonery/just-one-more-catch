export function versionImage(path: string, versions: Record<string, string>): string {
  const folder = path.startsWith("/sprites/") ? path.split("/").slice(1, 3).join("/") : path.split("/")[1];
  const version = versions[folder];
  if (!version) throw new Error(`Missing image fingerprint: ${path}`);
  return `${path}?v=${version}`;
}
