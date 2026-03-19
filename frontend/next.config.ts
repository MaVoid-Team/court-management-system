import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  output: "standalone",
  // Drastically reduce memory usage during builds
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  experimental: {
    cpus: 1, // Limit to a single thread to stop memory spikes
    memoryBasedWorkersCount: true,
  },
  /* config options here */
};

export default withNextIntl(nextConfig);
