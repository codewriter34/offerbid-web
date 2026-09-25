import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.amazonaws.com" },
      { protocol: "https", hostname: "**.cloudinary.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "**.googleusercontent.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "offerbid-api.onrender.com" },
    ],
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // @matrix-org/olm ships a single UMD-style olm.js that conditionally
      // does `require("fs")`/`require("path")`/`require("crypto")` in a
      // Node-only branch (guarded by `typeof window !== "undefined"` at
      // runtime). Webpack still statically resolves every `require()` it
      // sees regardless of that runtime guard, so the client bundle build
      // fails on `Can't resolve 'fs'` unless we tell it not to try. It's
      // never actually reached in the browser.
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
      };
    }
    return config;
  },
};

export default nextConfig;
