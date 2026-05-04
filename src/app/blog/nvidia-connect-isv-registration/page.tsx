import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "LIMS BOX NVIDIA Connect ISV Registration — LIMS BOX",
  description: "A factual note on NVIDIA Connect ISV registration and why local edge AI matters for lab workflows.",
};

export default function NvidiaBlog() {
  return (
    <main className="min-h-screen bg-[#0a0f1a]">
      {/* nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0f1a]/80 backdrop-blur-lg border-b border-[#1E3A5F]/30">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <a href="/" className="text-xl font-bold bg-gradient-to-r from-[#2E8B57] to-[#1E3A5F] bg-clip-text text-transparent">
            LIMS BOX
          </a>
          <div className="hidden md:flex gap-6 text-sm text-[#F8F9FA]/50">
            <a href="/" className="hover:text-white transition">Home</a>
            <a href="/blog" className="hover:text-white transition">Blog</a>
            <a href="/early-access" className="hover:text-white transition">Early Access</a>
          </div>
          <a href="/early-access" className="px-5 py-2 bg-[#2E8B57] hover:bg-[#2E8B57]/80 rounded-lg font-semibold text-sm transition-all text-white">
            Early Access
          </a>
        </div>
      </nav>

      <article className="pt-32 pb-24 px-6">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <a href="/blog" className="text-[#2E8B57] text-sm hover:underline mb-4 inline-block">← Back to Blog</a>
            <div className="text-sm text-[#2E8B57] font-medium mb-2">March 17, 2026</div>
            <h1 className="text-3xl md:text-4xl font-bold text-[#F8F9FA] mb-4">
              LIMS BOX NVIDIA Connect ISV Registration
            </h1>
            <p className="text-xl text-[#F8F9FA]/60 italic">
              A factual note on NVIDIA Connect ISV registration and why local edge AI matters for lab workflows.
            </p>
          </div>

          {/* Article content */}
          <div className="prose-custom space-y-6 text-[#F8F9FA]/70 leading-relaxed">
            <p>
              LIMS BOX is registered through NVIDIA Connect ISV. That is a registration status, not an endorsement claim,
              and there is no NVIDIA logo or endorsement on this site.
            </p>

            <p>
              At GTC 2026, Jensen Huang stood on stage and said something that mapped to the local-first AI direction:
            </p>

            <p className="text-lg text-[#F8F9FA] font-semibold italic">
              &ldquo;Mac and Windows are the OS for PCs. OpenClaw is the OS for personal AI.&rdquo;
            </p>

            <p>
              Then he announced NemoClaw — NVIDIA&apos;s enterprise-grade privacy and security layer for OpenClaw.
              Then he announced DGX Spark — a $3,000 portable AI supercomputer.
            </p>

            <p>
              The important point for LIMS BOX is not endorsement. It is that edge AI, local execution, and data locality
              are becoming mainstream infrastructure patterns for regulated workflows.
            </p>

            <h2 className="text-2xl font-bold text-[#2E8B57] mt-10 mb-4">
              The Convergence Nobody Saw Coming
            </h2>

            <p>
              Here&apos;s what NVIDIA announced at GTC that maps directly to LIMS BOX:
            </p>

            <p>
              <strong className="text-[#F8F9FA]">NemoClaw</strong> is NVIDIA&apos;s privacy-first framework for running
              AI locally. Data never leaves the device. Models run on-premise. Enterprise security baked in.
              That matches our deployment stance. We&apos;ve been building offline-first specifically because lab data
              and results often need customer-controlled deployment boundaries in regulated settings. NemoClaw points
              in the same local-first direction.
            </p>

            <p>
              <strong className="text-[#F8F9FA]">DGX Spark</strong> is a portable AI supercomputer. Price: $3,000.
              Runs NVIDIA&apos;s full AI stack in a compact form factor. Designed for edge deployment. LIMS BOX
              starts at $3,000. Same price point. Same edge deployment philosophy. Same bet on bringing compute
              to where the work happens.
            </p>

            <p>
              <strong className="text-[#F8F9FA]">OpenClaw</strong> as &ldquo;the OS for personal AI&rdquo; means local-first
              AI is becoming a broader platform pattern. NVIDIA is investing in developer tooling for that direction.
            </p>

            <h2 className="text-2xl font-bold text-[#2E8B57] mt-10 mb-4">
              Why This Matters for Laboratories
            </h2>

            <p>
              There are thousands of laboratories across the United States that still track samples on paper and
              spreadsheets. A traditional LIMS implementation costs <strong className="text-[#F8F9FA]">$50,000–$250,000</strong> and takes months.
              It requires dedicated IT staff, reliable internet, and ongoing vendor contracts. For a small or
              mid-size lab, that&apos;s not a solution — it&apos;s a fantasy.
            </p>

            <p>LIMS BOX is different:</p>

            <ul className="list-disc pl-6 space-y-2">
              <li><strong className="text-[#F8F9FA]">SENAITE</strong> — a proven open-source LIMS with 10+ years of development</li>
              <li><strong className="text-[#F8F9FA]">AI operator layer</strong> — staff interact in plain English, not complex software</li>
              <li><strong className="text-[#F8F9FA]">Docker containerization</strong> — <code className="text-[#E67E22] bg-[#2C3E50]/50 px-1.5 py-0.5 rounded">docker compose up</code> and you have a working lab</li>
              <li><strong className="text-[#F8F9FA]">Zero internet dependency</strong> — fully functional air-gapped</li>
              <li><strong className="text-[#F8F9FA]">Starting at $3K</strong> — the same price as NVIDIA&apos;s new DGX Spark</li>
            </ul>

            <p>
              When Jensen announced NemoClaw&apos;s privacy model — data never leaves the device, models run locally,
              enterprise security without cloud dependency — he was describing a deployment model that can support
              customer-specific validation and review for lab environments.
            </p>

            <h2 className="text-2xl font-bold text-[#2E8B57] mt-10 mb-4">
              The Hardware Spec Just Landed
            </h2>

            <p>
              Before GTC, the question was: &ldquo;What hardware do you run this on?&rdquo;
            </p>

            <p>
              Now the answer is clear. NVIDIA just released the spec sheet for edge AI deployment. DGX Spark,
              RTX workstations, and NemoClaw-enabled devices are the target hardware for local-first AI applications.
            </p>

            <p>
              LIMS BOX currently runs on Apple Silicon — fast, quiet, energy-efficient. But the DGX Spark at
              $3K opens up a second hardware path with NVIDIA&apos;s full CUDA stack, NemoClaw security, and enterprise support.
            </p>

            <p>
              Either way, the thesis is the same: <strong className="text-[#F8F9FA]">bring the compute to the samples,
              not the samples to the compute.</strong>
            </p>

            <h2 className="text-2xl font-bold text-[#2E8B57] mt-10 mb-4">
              What Happens Next
            </h2>

            <p>
              We have pilot applications coming in from environmental labs, forensic facilities, and contract
              testing operations. We are also tracking a broader edge AI ecosystem moving in the same local-first
              direction.
            </p>

            <p>
              Jensen did not mention LIMS BOX by name. The relevant signal is simpler: offline-first AI at the edge,
              enterprise privacy without cloud dependency, and compact compute are now mainstream topics.
            </p>

            <p>
              We&apos;ve been building that for a year. Now NVIDIA is building the platform underneath it.
            </p>

            <p className="text-lg font-semibold text-[#F8F9FA]">
              The hardware is here. The privacy model is here. The platform is here. Now we deliver.
            </p>

            {/* CTA */}
            <div className="mt-12 p-8 bg-[#2C3E50]/30 border border-[#2E8B57]/30 rounded-lg text-center">
              <h3 className="text-xl font-bold text-[#F8F9FA] mb-2">Join the Early Adopter Program</h3>
              <p className="text-[#F8F9FA]/60 mb-6">
                We&apos;re selecting 5 labs for LIMS BOX pilot program. Free trial period, direct access to
                the founder, and custom configuration for your lab.
              </p>
              <a
                href="/early-access"
                className="inline-block px-8 py-4 bg-[#2E8B57] hover:bg-[#2E8B57]/80 rounded-lg font-semibold text-lg transition-all text-white"
              >
                Apply for Early Access →
              </a>
            </div>

            {/* Author */}
            <div className="mt-8 pt-8 border-t border-[#1E3A5F]/30 text-sm text-[#F8F9FA]/50">
              <p>
                <strong className="text-[#F8F9FA]">Hudson Taylor</strong> is the founder of LIMS BOX. 15 years of
                LIMS implementation experience across public health, environmental, and clinical laboratories.
                MS Biochemistry, UC San Diego / Salk Institute.
              </p>
              <p className="mt-2">
                Learn more at <a href="https://lims.bot" className="text-[#2E8B57] hover:underline">lims.bot</a> or
                contact <a href="mailto:info@lims.bot" className="text-[#2E8B57] hover:underline">info@lims.bot</a>.
              </p>
            </div>
          </div>
        </div>
      </article>

      {/* footer */}
      <footer className="py-12 px-6 border-t border-[#1E3A5F]/30">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <div className="text-xl font-bold bg-gradient-to-r from-[#2E8B57] to-[#1E3A5F] bg-clip-text text-transparent mb-1">LIMS BOX</div>
            <div className="text-sm text-[#F8F9FA]/40">Modern lab informatics for small and mid-size labs.</div>
          </div>
          <div className="flex gap-8 text-sm text-[#F8F9FA]/50">
            <a href="/" className="hover:text-[#2E8B57] transition">Home</a>
            <a href="/blog" className="hover:text-[#2E8B57] transition">Blog</a>
            <a href="mailto:info@lims.bot" className="hover:text-[#2E8B57] transition">Contact</a>
          </div>
          <div className="text-sm text-[#F8F9FA]/30">
            © {new Date().getFullYear()} LIMS BOX. All rights reserved.
          </div>
        </div>
      </footer>
    </main>
  );
}
