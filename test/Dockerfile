FROM oven/bun:1 AS base
WORKDIR /usr/src

FROM base AS install
COPY lib/package.json lib/bun.lock lib/tsconfig.json lib/src lib/
COPY test/package.json test/bun.lock test/tsconfig.json test/
RUN cd lib && bun install --frozen-lockfile --production
RUN cd test && bun install --frozen-lockfile --production

FROM base AS release
COPY test/src test/package.json test/tsconfig.json /usr/src/app/
COPY --from=install /usr/src/test/node_modules /usr/src/app/node_modules
COPY --from=install /usr/src/lib /usr/src/lib

WORKDIR /usr/src/app
USER bun
ENTRYPOINT [ "bun", "test", "--bail", "--runInBand" ]