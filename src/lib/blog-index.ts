export interface BlogPostSummary {
  slug: string;
  title: string;
  date: string;
  published: string;
  excerpt: string;
  href: string;
}

export const posts: BlogPostSummary[] = [
  {
    slug: "5-signs-your-lab-has-outgrown-spreadsheets",
    title: "5 Signs Your Lab Has Outgrown Spreadsheets",
    date: "April 12, 2026",
    published: "2026-04-12",
    excerpt: "Still running your lab on Excel? Holding time misses, audit trail gaps, and transcription errors are signs you've outgrown spreadsheets. Here's when it's time for a real LIMS.",
    href: "/blog/5-signs-your-lab-has-outgrown-spreadsheets",
  },
  {
    slug: "why-small-labs-dont-need-enterprise-lims",
    title: "Why Small Labs Don't Need Enterprise LIMS",
    date: "April 12, 2026",
    published: "2026-04-12",
    excerpt: "Enterprise LIMS platforms are built for pharma giants with 500-seat deployments. If your environmental or water testing lab has under 50 people, you're paying for complexity you'll never use.",
    href: "/blog/why-small-labs-dont-need-enterprise-lims",
  },
  {
    slug: "why-lab-ai-agents-need-domain-expertise",
    title: "Why Lab AI Agents Need Domain Expertise",
    date: "April 2026",
    published: "2026-04-01",
    excerpt: "Generic AI fails in regulated laboratories because compliance isn't optional. A laboratory AI agent must understand validation, audit trails, chain of custody, and regulatory frameworks like ISO 17025 and 21 CFR Part 11.",
    href: "/blog/why-lab-ai-agents-need-domain-expertise",
  },
  {
    slug: "environmental-labs",
    title: "LIMS BOX for Environmental & Water Testing Labs",
    date: "June 2026",
    published: "2026-06-01",
    excerpt: "EPA compliance support, chain of custody, and seasonal surges — handled by a system designed to deploy in days, not months. How LIMS BOX addresses the five biggest pain points for environmental testing laboratories.",
    href: "/blog/environmental-labs",
  },
  {
    slug: "crime-labs",
    title: "LIMS BOX for Crime Labs & Forensic Science",
    date: "June 2026",
    published: "2026-06-01",
    excerpt: "When chain of custody gaps can get evidence thrown out of court, your lab management system isn't just software — it's infrastructure for justice. How LIMS BOX handles evidence tracking, accreditation, backlogs, and documentation burden.",
    href: "/blog/crime-labs",
  },
  {
    slug: "nvidia-connect-isv-registration",
    title: "LIMS BOX NVIDIA Connect ISV Registration",
    date: "March 17, 2026",
    published: "2026-03-17",
    excerpt: "A factual note on NVIDIA Connect ISV registration and why local edge AI matters for lab workflows.",
    href: "/blog/nvidia-connect-isv-registration",
  },
];

/** Sort a copy by ISO date; stable sort preserves source order for ties. */
export function sortNewestFirst(posts: readonly BlogPostSummary[]): BlogPostSummary[] {
  return [...posts].sort((a, b) =>
    a.published < b.published ? 1 : a.published > b.published ? -1 : 0,
  );
}
