# Security

Code handling AES-GCM encryption can be found in [lib](./lib/) directory. You can then refer to any calls to this library made through `import { ... } from 'lufin-lib'`, most notably [frontend/src/shared/upload.ts](./frontend/src/shared/upload.ts).

## Hardening your instance security

- After configuring HTTPS **and verifying it works** you should enable [HSTS](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Strict-Transport-Security) in your web server configuration.
- If you're running [Docker](./INSTALL.md#Docker) and ufw, make sure to secure internal Docker's network: [https://stackoverflow.com/a/51741599/13689893](https://stackoverflow.com/a/51741599/13689893)