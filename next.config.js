/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/admin/:path*',
        destination: '/admin/index.html', // Matched parameters can be used in the destination
      },
      {
        source: '/store/:path*',
        destination: '/store/index.html', // Matched parameters can be used in the destination
      },
    ]
  },
}
