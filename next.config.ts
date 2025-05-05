import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [new URL("https://disqus.com/api/users/avatars/**")],
  },
};

export default nextConfig;
