# Contributing to lufin

Thank you for taking time to learn how you can contribute to lufin.

Generally all PRs are welcome and are reviewed manually. No AI-written code is allowed. AI assistance (such as code autocompletion) is allowed to some extent.

Please take a moment to test your changes before submitting them using the `test` runner. Install Docker and Docker Compose, start Docker daemon, execute the ./start.sh script to start end-to-end testing of all Lufin components combinations.

## Translation

Learn how to contribute support for your language or fix translation.

This project only localizes frontend, backend part is completely in English. For frontend we use experimental [ParaglideJS](https://inlang.com/m/gerre34r/library-inlang-paraglideJs) library, so I recommended reading the Basics page to get started. You might also want to install Sherlock VSCode extension. To get started with a PR, fork this repository, clone locally and run `bun install` in frontend‘s repository.

All translations are stored in frontend/messages directory. Files must be two-characters code as defined by navigator.languages interface and Accept-Language header ([read more](https://inlang.com/m/gerre34r/library-inlang-paraglideJs/strategy#preferredlanguage)). You can also add regional languages such as `en-US.json`.

Translation files must be plain JSON objects with no nesting. I suggest naming keys in camelCase and separate sections with underscore. For example, if we want to translate a label on confirm button inside of a confirmation dialog, we‘d use `deleteConfirmation_confirmButton`. Each translation file must have `"$schema": "https://inlang.com/schema/inlang-message-format"`.

After translating all keys and placing your translation to frontend/messages/\[language\].json file, add your two-characters language code to frontend/project.inlang/settings.json -> locales array.

Next, you need to add the language to LanguageSwitch component in src/features/language-switch.tsx. To display a flag, the language must be supported by [svg-country-flags](https://github.com/hampusborgos/country-flags/tree/main/svg) library. Add the following entry to languagesMap array: `{ code: 'xx', flag: () => import('svg-country-flags/svg/xx.svg?react'), name: 'Language name' },`. Flag‘s country code can differ from language code, you need to consult the svg-country-flags‘s docs to get the country code. Please write the language name in its own language.

Finally, you must add a [date-fns](https://date-fns.org/v4.1.0/docs/I18n) locale corresponding to the added language. Add it to frontend/src/shared/utils/get-date-fns-locale.ts file.

Before submitting PR, please make sure everything you‘ve added works correctly. You need to run `bun run build` and `bun run preview`.