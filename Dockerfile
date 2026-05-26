# syntax=docker/dockerfile:1.7

# ─── Stage 1: build ─────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Instala deps com cache do lockfile (npm). Se preferir bun, troque pelo bloco abaixo.
COPY package.json package-lock.json* ./
RUN --mount=type=cache,target=/root/.npm npm ci

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
