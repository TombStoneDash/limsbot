import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Blog — THE LIMS BOX",
  description: "News and insights on laboratory informatics, compliance, and AI-powered lab management for environmental, forensic, cannabis, food safety, and contract labs.",
};

/* ────────── blog post data ────────── */
interface BlogPostSummary {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  href: string;
}

const posts: BlogPostSummary[] = [
  {
    slug: "5-signs-your-lab-has-outgrown-spreadsheets",
    title: "5 Signs Your Lab Has Outgrown Spreadsheets",
    date: "April 12, 2026",
    excerpt: "Still running your lab on Excel? Holding time misses, audit trail gaps, and transcription errors are signs you've outgrown spreadsheets. Here's when it's time for a real LIMS.",
    href: "/blog/5-signs-your-lab-has-outgrown-spreadsheets",
  },
  {
    slug: "why-small-labs-dont-need-enterprise-lims",
    title: "Why Small Labs Don't Need Enterprise LIMS",
    date: "April 12, 2026",
    excerpt: "Enterprise LIMS platforms are built for pharma giants with 500-seat deployments. If your environmental or water testing lab has under 50 people, you're paying for complexity you'll never use.",
    href: "/blog/why-small-labs-dont-need-enterprise-lims",
  },
  {
    slug: "why-lab-ai-agents-need-domain-expertise",
    title: "Why Lab AI Agents Need Domain Expertise",
    date: "April 2026",
    excerpt: "Generic AI fails in regulated laboratories because compliance isn't optional. A laboratory AI agent must understand validation, audit trails, chain of custody, and regulatory frameworks like ISO 17025 and 21 CFR Part 11.",
    href: "/blog/why-lab-ai-agents-need-domain-expertise",
  },
  {
    slug: "environmental-labs",
    title: "LIMS BOX for Environmental & Water Testing Labs",
    date: "June 2026",
    excerpt: "EPA compliance, chain of custody, and seasonal surges — handled by a system that deploys in days, not months. How LIMS BOX addresses the five biggest pain points for environmental testing laboratories.",
    href: "/blog/environmental-labs",
  },
  {
    slug: "crime-labs",
    title: "LIMS BOX for Crime Labs & Forensic Science",
    date: "June 2026",
    excerpt: "When chain of custody gaps can get evidence thrown out of court, your lab management system isn't just software — it's infrastructure for justice. How LIMS BOX handles evidence tracking, accreditation, backlogs, and documentation burden.",
    href: "/blog/crime-labs",
  },
  {
    slug: "nvidia-just-validated-the-lims-box-stack",
    title: "NVIDIA Just Validated the LIMS BOX Stack",
    date: "March 17, 2026",
    excerpt: "At GTC 2026, Jensen Huang announced NemoClaw and DGX Spark — and accidentally described our entire architecture. How NVIDIA's edge AI strategy validates the LIMS BOX approach.",
    href: "/blog/nvidia-just-validated-the-lims-box-stack",
  },
];

/* ────────── components ────────── */

function BlogPostCard({ post }: { post: BlogPostSummary }) {
  return (
    <Link href={post.href} className="block group">
      <article className="bg-[#2C3E50]/30 border border-[#1E3A5F]/30 rounded-2xl p-8 md:p-10 transition-all group-hover:border-[#2E8B57]/30 group-hover:shadow-lg group-hover:shadow-[#2E8B57]/5">
        <div className="text-sm text-[#2E8B57] font-medium mb-2">{post.date}</div>
        <h2 className="text-xl md:text-2xl font-bold text-[#F8F9FA] mb-3 group-hover:text-[#2E8B57] transition-colors">{post.title}</h2>
        <p className="text-[#F8F9FA]/60 mb-4">{post.excerpt}</p>
        <span className="text-[#2E8B57] text-sm font-medium group-hover:underline">Read more →</span>
      </article>
    </Link>
  );
}

/* ────────── page ────────── */
export default function BlogPage() {
  return (
    <main className="min-h-screen bg-[#0a0f1a]">
      {/* nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0f1a]/80 backdrop-blur-lg border-b border-[#1E3A5F]/30">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <a href="/" className="text-xl font-bold bg-gradient-to-r from-[#2E8B57] to-[#1E3A5F] bg-clip-text text-transparent">
            THE LIMS BOX
          </a>
          <div className="hidden md:flex gap-6 text-sm text-[#F8F9FA]/50">
            <a href="/" className="hover:text-white transition">Home</a>
            <a href="/blog" className="text-white transition">Blog</a>
            <a href="/early-access" className="hover:text-white transition">Early Access</a>
          </div>
          <a href="/early-access" className="px-5 py-2 bg-[#2E8B57] hover:bg-[#2E8B57]/80 rounded-lg font-semibold text-sm transition-all text-white">
            Early Access
          </a>
        </div>
      </nav>

      {/* header */}
      <div className="pt-32 pb-12 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-[#F8F9FA] mb-4">Blog</h1>
          <p className="text-[#F8F9FA]/60 text-lg">
            Insights on laboratory informatics, regulatory compliance, and practical LIMS implementation for small and mid-size labs.
          </p>
        </div>
      </div>

      {/* posts */}
      <div className="px-6 pb-24">
        <div className="max-w-4xl mx-auto space-y-6">
          {posts.map((post) => (
            <BlogPostCard key={post.slug} post={post} />
          ))}
        </div>
      </div>

      {/* footer */}
      <footer className="py-12 px-6 border-t border-[#1E3A5F]/30">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <div className="text-xl font-bold bg-gradient-to-r from-[#2E8B57] to-[#1E3A5F] bg-clip-text text-transparent mb-1">THE LIMS BOX</div>
            <div className="text-sm text-[#F8F9FA]/40">Modern lab informatics for small and mid-size labs.</div>
          </div>
          <div className="flex gap-8 text-sm text-[#F8F9FA]/50">
            <a href="/" className="hover:text-[#2E8B57] transition">Home</a>
            <a href="/blog" className="hover:text-[#2E8B57] transition">Blog</a>
            <a href="/early-access" className="hover:text-[#2E8B57] transition">Early Access</a>
            <a href="mailto:info@lims.bot" className="hover:text-[#2E8B57] transition">Contact</a>
          </div>
          <div className="text-sm text-[#F8F9FA]/30">
            © {new Date().getFullYear()} THE LIMS BOX. All rights reserved.
          </div>
        </div>
      </footer>
    </main>
  );
}
