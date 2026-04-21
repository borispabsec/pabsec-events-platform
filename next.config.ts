import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin({
  requestConfig: "./lib/i18n/request.ts",
});

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [],
  },
};

export default withNextIntl(nextConfig);
