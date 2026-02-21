import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "THE LIMS BOX — Healthcare Infrastructure That Goes Where It's Needed",
  description:
    "Plug-and-play LIMS system for rural and underserved clinics. AI-powered. Fully offline. Zero IT footprint. Plug in. Power on. Save lives.",
  keywords: [
    "LIMS",
    "laboratory information management",
    "rural healthcare",
    "AI healthcare",
    "portable lab",
    "offline LIMS",
    "healthcare infrastructure",
    "Pelican case lab",
    "Mac Studio LIMS",
    "healthcare desert",
  ],
  openGraph: {
    title: "THE LIMS BOX — Plug in. Power on. Save lives.",
    description:
      "Healthcare infrastructure that goes where it's needed. AI-powered portable laboratory. Fully offline. Zero IT footprint.",
    url: "https://limsbox.com",
    siteName: "THE LIMS BOX",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "THE LIMS BOX — Plug in. Power on. Save lives.",
    description:
      "47 million Americans live in healthcare deserts. THE LIMS BOX brings full diagnostic capabilities in a Pelican case. AI-powered. Fully offline.",
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
