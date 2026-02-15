import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "LIMSBOT — AI-Native Laboratory Information Management",
  description:
    "Your lab's AI operations lead. On-prem AI agent that manages sample tracking, instrument integration, compliance workflows, and result review. Data never leaves the building.",
  keywords: [
    "LIMS",
    "laboratory information management",
    "AI agent",
    "on-prem",
    "compliance",
    "21 CFR Part 11",
    "ISO 17025",
    "laboratory automation",
    "agentic AI",
  ],
  openGraph: {
    title: "LIMSBOT — AI That Runs Your Lab",
    description:
      "On-prem AI agent for laboratory operations. Sample tracking, instrument integration, compliance automation. Data never leaves the building.",
    url: "https://limsbot.com",
    siteName: "LIMSBOT",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "LIMSBOT — AI That Runs Your Lab",
    description:
      "On-prem AI agent for laboratory operations. $5K setup replaces $200K/yr cloud LIMS.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.className} antialiased`}>{children}</body>
    </html>
  );
}
