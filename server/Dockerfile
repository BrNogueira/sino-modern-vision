# syntax=docker/dockerfile:1.7

# ─── Stage 1: build (tsc → dist) ────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json* ./
RUN --mount=type=cache,target=/root/.npm npm ci
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# ─── Stage 2: runtime (só deps de produção + dist) ──────────────────────────
FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json* ./
RUN --mount=type=cache,target=/root/.npm npm ci --omit=dev
COPY --from=builder /app/dist ./dist
RUN mkdir -p /data/uploads
EXPOSE 4001
CMD ["node", "dist/index.js"]
