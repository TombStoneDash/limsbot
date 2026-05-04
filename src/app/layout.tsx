import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "LIMS BOX — Local AI for Lab Workflows",
  description:
    "Offline-capable lab intelligence for environmental, forensic, cannabis, food safety, and contract labs. SENAITE-based. COLA-aligned. Setup in days, validation per customer.",
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
    title: "LIMS BOX — Plug in. Power on. Run your lab.",
    description:
      "Local AI for lab workflows. Offline-capable, SENAITE-based, and built for customer-specific validation.",
    url: "https://lims.bot",
    siteName: "LIMS BOX",
    type: "website",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "LIMS BOX — Plug in. Power on. Run your lab.",
    description:
      "Local AI for sample tracking, chain of custody, and lab workflow support.",
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
      <head>
        {/* Google Ads conversion tracking */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=AW-17975356477" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'AW-17975356477');
            `,
          }}
        />
      </head>
      <body className={`${inter.className} antialiased`}>{children}</body>
    </html>
  );
}
