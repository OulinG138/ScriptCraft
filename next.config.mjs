/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Ensure the optimization and splitChunks objects exist
      config.optimization = config.optimization || {};
      config.optimization.splitChunks = config.optimization.splitChunks || {};
      config.optimization.splitChunks.cacheGroups =
        config.optimization.splitChunks.cacheGroups || {};

      // Add darkreader to cache groups
      config.optimization.splitChunks.cacheGroups.darkreader = {
        test: /[\\/]node_modules[\\/]darkreader[\\/]/,
        name: "darkreader",
        chunks: "all",
        priority: 10,
      };
    }
    return config;
  },
};

export default nextConfig;
