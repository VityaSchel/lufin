# lufin security

Code handling AES-GCM encryption can be found in [lib](./lib/) directory. You can then refer to any calls to this library made through `import { ... } from 'lufin-lib'`, most notably [frontend/src/shared/upload.ts](./frontend/src/shared/upload.ts).

## Hardening your instance security

- After configuring HTTPS **and verifying it works** you should enable [HSTS](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Strict-Transport-Security) in your web server configuration.
- If you're running [Docker](./docs/INSTALL.md#Docker) and ufw, make sure to secure internal Docker's network: [https://stackoverflow.com/a/51741599/13689893](https://stackoverflow.com/a/51741599/13689893)

## Reporting a security vulnerability

I believe security of lufin is primarily based on WebCrypto, AES-GCM, HTTPS and user's environment (JavaScript VM, TCP, TLS, OpenSSL, OS etc). If you found a security vulnerabilities in those, you should report it to authors of these projects and get a CVE code. You can then open an issue with this code for dependency upgrade or patch.

If you found a security vulnerability directly in lufin's code, I encourage you to open an issue publicly!