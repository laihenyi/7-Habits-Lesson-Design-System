/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    // /tool 於執行時讀取根目錄的 HTML，需確保部署時一併打包
    outputFileTracingIncludes: {
      '/tool': ['./lesson-designer-standalone.html'],
    },
  },
}

module.exports = nextConfig
