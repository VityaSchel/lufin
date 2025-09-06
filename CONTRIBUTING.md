# Contributing to lufin

Thank you for taking time to learn how you can contribute to lufin.

Generally all PRs are welcome and are reviewed manually. No AI-written code is allowed. AI assistance (such as code autocompletion) is allowed to some extent.

You are encouraged to test your changes before submitting them, especially if you're making changes to lib, test or backend. See [test/README.md -> Docker](./test/README.md#docker).

## Frontend

See [frontend/README.md](./frontend/README.md) and [frontend/CONTRIBUTING.md](./frontend/CONTRIBUTING.md).

Interested in contributing support for a language or fixing translation? This project only localizes frontend, backend is completely in English. Jump directly to [frontend/CONTRIBUTING.md#translation](./frontend/CONTRIBUTING.md#translation).

## Backend

See [backend/README.md](./backend/README.md) and [backend/CONTRIBUTING.md](./backend/CONTRIBUTING.md)

## Library (shared code)

This module shares code for files encryption. See [lib/README.md](lib/README.md).

## Test suite

This utility tests lufin backend. Currently the following combinations are tested: fs+postgresql, fs+mongodb, fs+sqlite, s3+postgresql, s3+mongodb, s3+sqlite. See [test/README.md](test/README.md).