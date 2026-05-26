# syntax=docker/dockerfile:1.7

# ─── Stage 1: build ─────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Instala deps com cache do lockfile (npm).
# --legacy-peer-deps é necessário porque react-leaflet@5 declara peer react@^19,
# mas o projeto roda em react@18 (mesmo conflito ignorado pelo bun localmente).
COPY package.json package-lock.json* ./
RUN --mount=type=cache,target=/root/.npm npm ci --legacy-peer-deps

# Copia código e builda
COPY . .
RUN npm run build

# ─── Stage 2: runtime ───────────────────────────────────────────────────────
FROM nginx:1.27-alpine AS runtime

# Remove default config e copia o nosso (SPA fallback)
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Artefato estático
COPY --from=builder /app/dist /usr/share/nginx/html

# Turbo Cloud injeta $PORT em runtime — fallback 80 pra rodar local
ENV PORT=80
EXPOSE 80

# Substitui o listen pelo $PORT antes do nginx subir (PaaS-friendly)
CMD ["/bin/sh", "-c", "sed -i \"s/listen 80;/listen ${PORT};/\" /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"]
