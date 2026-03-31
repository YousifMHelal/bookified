import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'covers.openlibrary.org' },
      { protocol: 'https', hostname: 'ldedwda1wo93frl0.public.blob.vercel-storage.com' },
    ]
  }
};

export default nextConfig;
