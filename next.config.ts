/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },

  // 🔥 FIX για το Vercel worker crash
  turbopack: {},

  // 🔥 Επιτρέπει το κινητό σου να φορτώσει τα dev scripts
  allowedDevOrigins: ['192.168.1.9'],

  webpack: (config: any) => {
    return config;
  },
};

export default nextConfig;
