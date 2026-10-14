import type { NextConfig } from "next";

// Strip trailing slashes so "https://host/" does not produce "//api" paths.
const API_URL = (process.env.API_URL ?? "http://localhost:5000").replace(/\/+$/, "");

const nextConfig: NextConfig = {
  // The browser only ever talks to this origin; /api/* is proxied to the Express
  // server so the httpOnly auth cookie is first-party and readable by proxy.ts.
  async rewrites() {
    return [{ source: "/api/:path*", destination: `${API_URL}/api/:path*` }];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
