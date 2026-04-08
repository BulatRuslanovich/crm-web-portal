FROM node:20-slim AS builder

WORKDIR /app

# уменьшаем память Node
ENV NODE_OPTIONS="--max-old-space-size=512"

COPY package*.json ./

# быстрее и легче
RUN npm ci --no-audit --no-fund

COPY . .

ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

# webpack вместо turbopack
RUN npm run build

# -----------------------------

FROM node:20-slim AS runner

WORKDIR /app

ENV NODE_ENV=production

# копируем только нужное
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# уменьшаем память рантайма тоже
ENV NODE_OPTIONS="--max-old-space-size=256"

EXPOSE 3000

CMD ["node", "server.js"]