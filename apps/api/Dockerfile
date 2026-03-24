FROM node:20-slim AS base
WORKDIR /app

COPY package.json yarn.lock ./
COPY apps/api/package.json apps/api/
COPY packages/shared/package.json packages/shared/

RUN yarn install --frozen-lockfile --production=false

COPY packages/shared packages/shared
COPY apps/api apps/api

WORKDIR /app/apps/api
EXPOSE 3001
CMD ["npx", "tsx", "src/index.ts"]
