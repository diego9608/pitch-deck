import path from "node:path";

const nextConfig = {
  outputFileTracingRoot: path.join(process.cwd(), "..", ".."),
  experimental: {
    serverActions: { bodySizeLimit: "2mb" }
  }
};

export default nextConfig;
