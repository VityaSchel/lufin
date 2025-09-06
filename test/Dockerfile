FROM lufin/lib:latest AS base
WORKDIR /usr/src/app

FROM base AS install
# RUN mkdir -p /temp/dev
# COPY package.json bun.lock /temp/dev/
# RUN cd /temp/dev && bun install --frozen-lockfile

RUN mkdir -p /temp/prod
COPY package.json bun.lock /temp/prod/
RUN cd /temp/prod && bun install --frozen-lockfile --production

FROM base AS prerelease
# COPY --from=install /temp/dev/node_modules node_modules
COPY . .

# ENV NODE_ENV=production
# # RUN bun test
# RUN bun run build

FROM base AS release
COPY --from=install /temp/prod/node_modules node_modules
COPY --from=prerelease /usr/src/app/src src
COPY --from=prerelease /usr/src/app/package.json .

# run the app
USER bun
ENTRYPOINT [ "bun", "test", "--bail", "--runInBand" ]
