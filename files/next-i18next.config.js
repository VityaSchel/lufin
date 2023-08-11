/** @type {import('next-i18next').UserConfig} */
module.exports = {
  defaultNS: 'filesharing',
  i18n: {
    defaultLocale: 'en',
    locales: [
      'ru',
      'en',
      'bg',
      'cs',
      'da',
      'nl',
      'et',
      'fi',
      'fr',
      'de',
      'el',
      'hu',
      'it',
      'lv',
      'lt',
      'no',
      'pl',
      'pt',
      'ro',
      'sk',
      'sl',
      'es',
      'sv',
      'tr'
    ],
  },
  reloadOnPrerender: process.env.NODE_ENV === 'development',
}