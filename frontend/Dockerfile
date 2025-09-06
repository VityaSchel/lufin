FROM lufin/lib:latest AS base
WORKDIR /usr/src/app
ARG API_URL
ARG PUBLIC_ADMIN_EMAIL

FROM base AS install
RUN mkdir -p /temp/dev
COPY package.json bun.lock /temp/dev/
COPY vendor /temp/dev/vendor
RUN cd /temp/dev && bun install --frozen-lockfile

RUN mkdir -p /temp/prod
COPY package.json bun.lock /temp/prod/
COPY vendor /temp/prod/vendor
RUN cd /temp/prod && bun install --frozen-lockfile --production

FROM base AS prerelease
COPY --from=install /temp/dev/node_modules node_modules
RUN ln -s /usr/src/lib /temp/lib
COPY . .

ENV NODE_ENV=production
ENV VITE_API_URL=$API_URL
ENV VITE_CONTACT_EMAIL=$PUBLIC_ADMIN_EMAIL
# RUN bun test
RUN bun run build

FROM base AS release
COPY --from=prerelease /usr/src/app/dist dist