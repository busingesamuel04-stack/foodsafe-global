/** @type {import('next').NextConfig} */
const isStaticExport = 
  process.env.OUTPUT_EXPORT === 'true' || 
  process.env.NEXT_EXPORT === 'true' || 
  process.env.CF_PAGES === '1';

const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  ...(isStaticExport ? { output: 'export' } : {}),
};

export default nextConfig;
