# Lufin — a modern self-hosted file-sharing service

[![CodeQL status](https://github.com/VityaSchel/lufin/actions/workflows/github-code-scanning/codeql/badge.svg)](https://github.com/VityaSchel/lufin/actions/workflows/github-code-scanning/codeql) [![Testing](https://github.com/VityaSchel/lufin/actions/workflows/testing.yml/badge.svg)](https://github.com/VityaSchel/lufin/actions/workflows/testing.yml)

Lufin (Let’s Upload that File—Next) is a modern alternative to [lufi](https://framagit.org/fiat-tux/hat-softwares/lufi).

<p float="left">
  <img src="docs/screenshot-1.png" width="49%" />
  <img src="docs/screenshot-2.png" width="49%" /> 
</p>

- ✨ Modern neat design
- 📁 S3 storage support (with Cloudflare R2 compatability)
- 🌄 Rich client-side preview for
  - 🖼️ Images
  - 🎵 Audio
  - 🎥 Video
  - 🗂️ Zip archives
  - 📊 XLSX spreadsheets
  - 📝 Text files
  - 📖 PDF
- 🗣️ Translated to 26 languages: English, Русский, Українська, Беларуская, Български, Čeština, Dansk, Nederlands, Eesti, Suomi, Français, Deutsch, Ελληνικά, Magyar, Italiano, Latviešu, Lietuvių, Norsk, Polski, Português, Română, Slovenčina, Slovenščina, Español, Svenska, Türkçe. See [CONTRIBUTING.md](./CONTRIBUTING.md#frontend) for information on how to contibute support for a language.
- 🛡️ Client-side metadata stripping such as EXIF from images
- 🔥 Configurable data retention settings based on files size
- 🔐 Optional end-to-end encryption using AES-GCM allowing user to opt-out to embed files via hotlinks
- 🔑 Password protection
- 👀 Delete at first downlaod
- 🗃️ Client-side archive generation before uploading
- 📸 Client-side image compression
- ✏️ Automatic file renaming with option to keep original filenames
- 📀 Multiple databases support (MongoDB, PostgreSQL, SQLite)
- ⚡️ Fully static frontend (no SSR, no Next.js needed running for the website)
- 📦 Docker Compose deployment with automatic HTTPS out of the box
- 💻 Links to uploaded files are stored in LocalStorage
- 💾 Importable/exportable LocalStorage with a button to clean up expired pages

**This app requires JavaScript in order for client-side encryption to work.**

Stack: React, Vite & Rollup, Material UI, SCSS modules, TailwindCSS, MongoDB, PostgreSQL, Drizzle ORM & Kit, Elysia, Bun.

Demo: [lufin.hloth.dev](https://lufin.hloth.dev)

> [!NOTE]
> It's a demo website and files get deleted very quickly, it's only purpose is demonstration of the project

- [Lufin — a modern self-hosted file-sharing service](#lufin--a-modern-self-hosted-file-sharing-service)
  - [Screenshotter browser extension](#screenshotter-browser-extension)
  - [Installation](#installation)
  - [Motivation](#motivation)
  - [License](#license)
  - [Donate](#donate)


## Screenshotter browser extension

See also: a related project — Firefox-based browser extension for taking full-screen, partial, full-screen cropped screenshots, with a built-in image editor and an option to instantly upload to your choosen lufin instance. Free, no ads, no trackers, no metrics, 100% opensource.

<img width="1505" alt="Screenshotter editor" src="https://github.com/user-attachments/assets/89d9ac3a-cf86-480e-bb21-b8edb08bd069" />

[Visit screenshotter repository](https://github.com/VityaSchel/lufin-screenshotter)

## Installation

Read [INSTALL.md](./docs/INSTALL.md) for steps to install and run lufin on your machine.

## Motivation

I was working on this project in August 2023 - October 2023 as a part of a larger platform for one of my Freelance clients. In late 2024 I had to leave working on them because they were constantly harassing, threatening and abusing me. This is a cleaned up version of filesharing subproject that I made for them, originally built as a microfrontend for Next.js.

I made this project while I was working primarily with React and Next.js as web frameworks and MongoDB as my favorite database. Things have changed and nowadays I only use Svelte and PostgreSQL. First commits were deliberetly offset by exactly -22 months.

Before publishing this project I rewrote the backend from Fastify to Elysia, migrated from Next.js to Vite, from Next router to React Router, from i18next to paraglide js, optimized build size, separated code to dynamic chunks and put everything into Docker Compose containers.

## License

[MIT](./LICENSE)

## Donate

[hloth.dev/donate](https://hloth.dev/donate)
