export const mainContentId = "main-content";

export type NavItem = { readonly href: string; readonly label: string };

export const primaryNav = [
  { href: "/", label: "Home" },
  { href: "/writing", label: "Writing" },
  { href: "/projects", label: "Projects" },
  { href: "/experience", label: "Experience" },
  { href: "/resume", label: "Resume" },
] as const satisfies readonly NavItem[];

function normalize(pathname: string): string {
  const end = pathname.search(/[?#]/);
  const path = end === -1 ? pathname : pathname.slice(0, end);
  const stripped = path.replace(/\/+$/, "");
  return stripped === "" ? "/" : stripped;
}

export function isActive(
  pathname: string | null | undefined,
  href: string,
): boolean {
  if (!pathname) return false;
  const normalized = normalize(pathname);
  if (href === "/") return normalized === "/";
  return normalized === href || normalized.startsWith(href + "/");
}
