# FROM lufin/lib:latest AS base
FROM oven/bun:1.2.21 AS base
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
# RUN bun test
# RUN bun run build

FROM base AS release
COPY --from=install /temp/prod/node_modules node_modules
COPY --from=prerelease /usr/src/app/src src
COPY --from=prerelease /usr/src/app/drizzle drizzle
COPY --from=prerelease /usr/src/app/drizzle.config.ts .
COPY --from=prerelease /usr/src/app/tsconfig.json .
COPY --from=prerelease /usr/src/app/package.json .

# USER bun
ENTRYPOINT [ "sh", "-c", "bun db:migrate && exec bun start" ]
