FROM node:20-slim AS builder

WORKDIR /app

COPY package*.json ./

RUN npm ci --no-audit --no-fund

COPY . .

ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

RUN npm run build

# -----------------------------

FROM node:20-slim AS runner

WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nextjs && \
    adduser --system --uid 1001 nextjs

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
