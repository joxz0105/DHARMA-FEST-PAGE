import createNextIntlPlugin from "next-intl/plugin";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: { formats: ["image/avif", "image/webp"] },
};

export default createNextIntlPlugin("./i18n/request.ts")(nextConfig);
