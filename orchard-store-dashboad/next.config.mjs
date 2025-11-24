/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    reactCompiler: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "9000",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "9000",
        pathname: "/**",
      },
      // Cho phép các domain khác nếu cần (production MinIO, S3, etc.)
      {
        protocol: "https",
        hostname: "**.supabase.co",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
