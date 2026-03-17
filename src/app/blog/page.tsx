import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog — THE LIMS BOX",
  description: "News and insights from THE LIMS BOX team on portable laboratory infrastructure, rural healthcare, and AI-powered diagnostics.",
};

/* ────────── blog post data ────────── */
interface BlogPost {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  content: string;
}

const posts: BlogPost[] = [
  {
    slug: "nvidia-just-validated-the-lims-box-stack",
    title: "NVIDIA Just Validated the LIMS BOX Stack",
    date: "March 17, 2026",
    excerpt: "At GTC 2026, Jensen Huang announced NemoClaw and DGX Spark — and accidentally described our entire architecture.",
    content: `At GTC 2026, Jensen Huang stood on stage and said something that stopped me mid-coffee:

**"Mac and Windows are the OS for PCs. OpenClaw is the OS for personal AI."**

Then he announced NemoClaw — NVIDIA's enterprise-grade privacy and security layer for OpenClaw. Then he announced DGX Spark — a $3,000 portable AI supercomputer.

I set my coffee down and called my co-founder. Because Jensen Huang just described the architecture we've been building for the last year.

---

## The Convergence Nobody Saw Coming

Here's what NVIDIA announced at GTC that maps directly to THE LIMS BOX:

**NemoClaw** is NVIDIA's privacy-first framework for running AI locally. Data never leaves the device. Models run on-premise. Enterprise security baked in.

That's our HIPAA/CLIA compliance strategy. We've been building offline-first specifically because patient data and lab results cannot leave the building in a clinical setting. NemoClaw validates that approach at the platform level.

**DGX Spark** is a portable AI supercomputer. Price: $3,000. Runs NVIDIA's full AI stack in a compact form factor. Designed for edge deployment.

THE LIMS BOX starts at $3,000. Same price point. Same edge deployment philosophy. Same bet on bringing compute to where the work happens instead of shipping data to the cloud.

**OpenClaw** as "the OS for personal AI" means local-first AI isn't a niche play anymore. It's the platform. NVIDIA just committed their entire developer ecosystem to the same architectural bet we made a year ago.

---

## Why This Matters for Rural Healthcare

There are **1,386 Critical Access Hospitals** in the United States — the last line of defense for communities where the nearest specialist is 100 miles away. Since 2010, **152 rural hospitals have closed**. The ones that remain are stretched thin. Their labs are tracking samples on paper and spreadsheets.

A traditional LIMS implementation costs **$50,000–$250,000** and takes months. It requires dedicated IT staff, reliable internet, and ongoing vendor contracts. For a 15-bed rural hospital, that's not a solution. It's a fantasy.

THE LIMS BOX is different:

- **SENAITE** — a proven open-source LIMS with 10+ years of development
- **AI operator layer** — staff interact in plain English, not complex software
- **Docker containerization** — \`docker compose up\` and you have a working lab
- **Zero internet dependency** — fully functional air-gapped
- **Starting at $3K** — the same price as NVIDIA's new DGX Spark

When Jensen announced NemoClaw's privacy model — data never leaves the device, models run locally, enterprise security without cloud dependency — he was describing the exact compliance architecture that HIPAA and CLIA demand from clinical laboratories.

---

## The Hardware Spec Just Landed

Before GTC, the question was: "What hardware do you run this on?"

Now the answer is clear. NVIDIA just released the spec sheet for edge AI deployment. DGX Spark, RTX workstations, and NemoClaw-enabled devices are the target hardware for local-first AI applications.

THE LIMS BOX currently runs on Apple Silicon — fast, quiet, energy-efficient. But the DGX Spark at $3K opens up a second hardware path with NVIDIA's full CUDA stack, NemoClaw security, and enterprise support.

Either way, the thesis is the same: **bring the compute to the patient, not the patient to the compute.**

---

## What Happens Next

We have a discovery call this week with a potential LIMS BOX customer. We have pilot applications coming in from rural facilities and disaster response organizations. And now we have the world's largest AI company validating our architecture on the biggest stage in tech.

Jensen didn't mention THE LIMS BOX by name. He didn't have to. He described offline-first AI at the edge, enterprise privacy without cloud dependency, and a $3K portable supercomputer.

We've been building that for a year. Now NVIDIA is building the platform underneath it.

**1,386 Critical Access Hospitals. 152 closures. Labs on paper.**

The hardware is here. The privacy model is here. The platform is here.

Now we deliver.

---

*Hudson Taylor is the founder of Tombstone Dash LLC and creator of THE LIMS BOX. 15 years of LIMS implementation experience across public health, clinical, and environmental laboratories. MS Biochemistry, UC San Diego / Salk Institute.*

*Learn more at [lims.bot](https://lims.bot) or contact [info@lims.bot](mailto:info@lims.bot).*`,
  },
];

/* ────────── components ────────── */

function BlogPostCard({ post }: { post: BlogPost }) {
  return (
    <article className="bg-[#2C3E50]/30 border border-[#1E3A5F]/30 rounded-2xl p-8 md:p-12 mb-12">
      <div className="text-sm text-[#2E8B57] font-medium mb-2">{post.date}</div>
      <h2 className="text-2xl md:text-3xl font-bold text-[#F8F9FA] mb-4">{post.title}</h2>
      <p className="text-[#F8F9FA]/60 text-lg mb-8 italic">{post.excerpt}</p>
      <div className="prose prose-invert prose-lg max-w-none
        prose-headings:text-[#F8F9FA] prose-headings:font-bold
        prose-h2:text-xl prose-h2:mt-10 prose-h2:mb-4 prose-h2:text-[#2E8B57]
        prose-p:text-[#F8F9FA]/70 prose-p:leading-relaxed prose-p:mb-4
        prose-strong:text-[#F8F9FA]
        prose-a:text-[#2E8B57] prose-a:no-underline hover:prose-a:underline
        prose-li:text-[#F8F9FA]/70
        prose-hr:border-[#1E3A5F]/30 prose-hr:my-8
        prose-code:text-[#E67E22] prose-code:bg-[#2C3E50]/50 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
        prose-em:text-[#F8F9FA]/50
      ">
        {post.content.split("\n\n").map((block, i) => {
          // Headings
          if (block.startsWith("## ")) {
            return <h2 key={i}>{block.replace("## ", "")}</h2>;
          }
          // Horizontal rules
          if (block.trim() === "---") {
            return <hr key={i} />;
          }
          // List items
          if (block.startsWith("- ")) {
            return (
              <ul key={i} className="list-disc pl-6 space-y-2 mb-4">
                {block.split("\n").map((line, j) => (
                  <li key={j}>{renderInline(line.replace(/^- /, ""))}</li>
                ))}
              </ul>
            );
          }
          // Regular paragraphs
          return <p key={i}>{renderInline(block)}</p>;
        })}
      </div>
    </article>
  );
}

function renderInline(text: string): React.ReactNode {
  // Handle bold, inline code, links, and italic
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    // Bold
    const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
    // Inline code
    const codeMatch = remaining.match(/`(.+?)`/);
    // Links
    const linkMatch = remaining.match(/\[(.+?)\]\((.+?)\)/);
    // Italic
    const italicMatch = remaining.match(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/);

    // Find earliest match
    const matches = [
      boldMatch && { type: "bold", match: boldMatch, index: boldMatch.index! },
      codeMatch && { type: "code", match: codeMatch, index: codeMatch.index! },
      linkMatch && { type: "link", match: linkMatch, index: linkMatch.index! },
      italicMatch && { type: "italic", match: italicMatch, index: italicMatch.index! },
    ].filter(Boolean) as { type: string; match: RegExpMatchArray; index: number }[];

    if (matches.length === 0) {
      parts.push(remaining);
      break;
    }

    const earliest = matches.reduce((a, b) => (a.index < b.index ? a : b));

    // Add text before match
    if (earliest.index > 0) {
      parts.push(remaining.substring(0, earliest.index));
    }

    if (earliest.type === "bold") {
      parts.push(<strong key={key++}>{earliest.match[1]}</strong>);
    } else if (earliest.type === "code") {
      parts.push(<code key={key++}>{earliest.match[1]}</code>);
    } else if (earliest.type === "link") {
      parts.push(
        <a key={key++} href={earliest.match[2]} className="text-[#2E8B57] hover:underline">
          {earliest.match[1]}
        </a>
      );
    } else if (earliest.type === "italic") {
      parts.push(<em key={key++}>{earliest.match[1]}</em>);
    }

    remaining = remaining.substring(earliest.index + earliest.match[0].length);
  }

  return <>{parts}</>;
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
          </div>
          <a href="/#waitlist" className="px-5 py-2 bg-[#2E8B57] hover:bg-[#2E8B57]/80 rounded-lg font-semibold text-sm transition-all text-white">
            Join Waitlist
          </a>
        </div>
      </nav>

      {/* header */}
      <div className="pt-32 pb-12 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-[#F8F9FA] mb-4">Blog</h1>
          <p className="text-[#F8F9FA]/60 text-lg">
            News and insights on portable laboratory infrastructure, rural healthcare, and AI-powered diagnostics.
          </p>
        </div>
      </div>

      {/* posts */}
      <div className="px-6 pb-24">
        <div className="max-w-4xl mx-auto">
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
            <div className="text-sm text-[#F8F9FA]/40">Healthcare infrastructure that goes where it&apos;s needed.</div>
          </div>
          <div className="flex gap-8 text-sm text-[#F8F9FA]/50">
            <a href="/" className="hover:text-[#2E8B57] transition">Home</a>
            <a href="/blog" className="hover:text-[#2E8B57] transition">Blog</a>
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
