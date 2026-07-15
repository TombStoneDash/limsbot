import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";

const REPO_ROOT = path.resolve(__dirname, "..", "..");
export const APP_DIR = path.join(REPO_ROOT, "src", "app");
export const PUBLIC_DIR = path.join(REPO_ROOT, "public");

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const full = path.join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) return walk(full);
    return [full];
  });
}

export interface SourceFile {
  /** absolute path */
  file: string;
  /** path relative to repo root, for readable test failures */
  relFile: string;
  content: string;
}

/** Every .ts/.tsx file under src/app — pages, layouts, and API routes. */
export function readAllAppSource(): SourceFile[] {
  return walk(APP_DIR)
    .filter((f) => f.endsWith(".ts") || f.endsWith(".tsx"))
    .map((file) => ({
      file,
      relFile: path.relative(REPO_ROOT, file),
      content: readFileSync(file, "utf-8"),
    }));
}

/**
 * Real routes served by the app, derived from the filesystem so this list
 * can never drift from what Next.js actually serves — e.g. src/app/page.tsx
 * -> "/", src/app/blog/crime-labs/page.tsx -> "/blog/crime-labs".
 */
export function listRoutes(): string[] {
  return walk(APP_DIR)
    .filter((f) => path.basename(f) === "page.tsx")
    .map((f) => {
      const rel = path.relative(APP_DIR, path.dirname(f));
      return rel === "." ? "/" : `/${rel.split(path.sep).join("/")}`;
    });
}

/** Files under public/, as the URL paths Next.js serves them at. */
export function listPublicFiles(): string[] {
  return walk(PUBLIC_DIR).map((f) => `/${path.relative(PUBLIC_DIR, f).split(path.sep).join("/")}`);
}

/** Every `id="..."` attribute across all app source — valid same-page anchor targets. */
export function listAnchorIds(): Set<string> {
  const ids = new Set<string>();
  for (const { content } of readAllAppSource()) {
    for (const match of content.matchAll(/\bid="([^"]+)"/g)) {
      ids.add(match[1]);
    }
  }
  return ids;
}

/**
 * Every link destination found in app source, with the file it came from —
 * both JSX attribute form (`href="..."`, e.g. `<a href="/blog">`) and object-literal
 * form (`href: "..."`, e.g. the `posts[]` data array in blog/page.tsx that a `<Link
 * href={post.href}>` reads from). Without the second pattern, data-array-driven links
 * have zero coverage here even though they render real, clickable CTAs.
 */
export function extractHrefs(): { href: string; relFile: string }[] {
  const results: { href: string; relFile: string }[] = [];
  for (const { content, relFile } of readAllAppSource()) {
    for (const match of content.matchAll(/\bhref="([^"]+)"/g)) {
      results.push({ href: match[1], relFile });
    }
    for (const match of content.matchAll(/\bhref:\s*"([^"]+)"/g)) {
      results.push({ href: match[1], relFile });
    }
  }
  return results;
}
