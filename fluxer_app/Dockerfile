FROM node:24-bookworm-slim

WORKDIR /usr/src/app

RUN corepack enable && corepack prepare pnpm@10.26.0 --activate

RUN apt-get update && apt-get install -y --no-install-recommends \
		curl \
		openssl \
		&& rm -rf /var/lib/apt/lists/*

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY patches/ ./patches/
COPY packages/ ./packages/
COPY fluxer_app/ ./fluxer_app/
COPY fluxer_app/pkgs/ ./fluxer_app/pkgs/

RUN pnpm install --ignore-scripts --config.trust-policy=loose
RUN cd fluxer_app && pnpm generate:colors && pnpm generate:css-types && pnpm lingui:compile

WORKDIR /usr/src/app/fluxer_app

ENV FLUXER_CONFIG=/usr/src/app/config/config.json
ENV NODE_ENV=production

COPY config/ ../config/
COPY plugins/ ../plugins/
COPY fluxer_static/ ../fluxer_static/
COPY fluxer_app/docker-entrypoint.sh ./docker-entrypoint.sh

RUN rm -rf dist && pnpm rspack build --mode production
RUN chmod +x docker-entrypoint.sh

EXPOSE 8080

ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["pnpm", "tsx", "scripts/DevServer.tsx"]
