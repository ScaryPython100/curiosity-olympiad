import withPWAInit from "@ducanh2912/next-pwa";
import type { NextConfig } from "next";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development", 
  register: true,
  // Don't download big or optional files on a phone's first visit (2G data).
  // They are still saved for offline use the first time they are shown.
  publicExcludes: [
    "!noprecache/**/*",
    "!avatars/**/*",
    "!i18n/**/*",
    "!kuppu-mascot.jpg",
    "!agastya-science-van.jpg",
    "!icons/icon-512.png",
  ],
});

const nextConfig: NextConfig = {
  reactStrictMode: true,
  devIndicators: false,
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default withPWA(nextConfig);