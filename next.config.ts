import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // limsbox.com → lims.bot (301 permanent redirect)
      {
        source: "/:path*",
        has: [{ type: "host", value: "limsbox.com" }],
        destination: "https://lims.bot/:path*",
        permanent: true,
      },
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.limsbox.com" }],
        destination: "https://lims.bot/:path*",
        permanent: true,
      },
      // thelimsbox.com → lims.bot
      {
        source: "/:path*",
        has: [{ type: "host", value: "thelimsbox.com" }],
        destination: "https://lims.bot/:path*",
        permanent: true,
      },
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.thelimsbox.com" }],
        destination: "https://lims.bot/:path*",
        permanent: true,
      },
      // limsbot.com → lims.bot
      {
        source: "/:path*",
        has: [{ type: "host", value: "limsbot.com" }],
        destination: "https://lims.bot/:path*",
        permanent: true,
      },
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.limsbot.com" }],
        destination: "https://lims.bot/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
