import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Flyers and photos uploaded in the Sanity Studio are served from Sanity's image CDN.
    // `search` is left out so the builder's query string (?w=1000) is allowed.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
        pathname: "/images/**",
      },
    ],
  },
};

export default nextConfig;
