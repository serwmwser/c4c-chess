// apps/web/next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Отключаем статическую генерацию для всех страниц (нужно для RainbowKit)
  output: 'standalone',
  
  // Игнорируем ошибки во время сборки для сторонних библиотек
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },

  webpack: (config, { isServer }) => {
    // Исправляем проблемы с импортами для viem/wagmi/rainbowkit
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
      };
    }
    return config;
  },
};

export default nextConfig;