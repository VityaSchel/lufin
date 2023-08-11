/* eslint-disable @typescript-eslint/no-var-requires */
const { ContextReplacementPlugin, IgnorePlugin } = require('webpack')
const { i18n } = require('./next-i18next.config')

// import('next').NextConfig


/** @type {import('next').NextConfig}*/
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  headers() {
    return [
      {
        source: '/locales/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,DELETE,PATCH,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date' },
        ]
      }
    ]
  },
  webpack(
    config
    , { isServer }) {
    if(!config.plugins) config.plugins = []

    const fileLoaderRule = config.module?.rules?.find((rule) =>
      rule.test?.test?.('.svg'),
    )
    if(config.module) {
      if(!config.module.rules) {
        config.module.rules =  []
      }
      if (fileLoaderRule) {
        config.module.rules.push(
          {
            ...fileLoaderRule,
            test: /\.svg$/i,
            resourceQuery: /url/,
          }
        )
      }
      config.module.rules.push(
        {
          test: /\.svg$/i,
          issuer: /\.[jt]sx?$/,
          resourceQuery: { not: /url/ },
          use: ['@svgr/webpack'],
        },
      )
      fileLoaderRule.exclude = /\.svg$/i
    }

    config.experiments = { 
      ...config.experiments,
      topLevelAwait: true
    }

    return config
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  i18n,
}

module.exports = nextConfig