import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "THE LIMS BOX — Lab Informatics That Deploys in Minutes",
  description:
    "Plug-and-play LIMS for environmental, forensic, cannabis, food safety, and contract labs. AI-powered. Fully offline. ISO 17025 ready. Under $500/month.",
  metadataBase: new URL("https://lims.bot"),
  keywords: [
    "LIMS",
    "laboratory information management",
    "environmental testing LIMS",
    "forensic lab LIMS",
    "cannabis testing LIMS",
    "food safety LIMS",
    "AI LIMS",
    "portable LIMS",
    "offline LIMS",
    "ISO 17025",
    "chain of custody",
    "EPA compliance",
    "small lab LIMS",
    "affordable LIMS",
  ],
  openGraph: {
    title: "THE LIMS BOX — Plug in. Power on. Run your lab.",
    description:
      "Modern lab informatics for small and mid-size labs. AI-powered. Fully offline. ISO 17025 ready. Set up in days, not months.",
    url: "https://lims.bot",
    siteName: "THE LIMS BOX",
    type: "website",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "THE LIMS BOX — Plug in. Power on. Run your lab.",
    description:
      "Lab informatics that deploys in minutes. Sample tracking, chain of custody, and regulatory compliance for environmental, forensic, and contract labs.",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
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
