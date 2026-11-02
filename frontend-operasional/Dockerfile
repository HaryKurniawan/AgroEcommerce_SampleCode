FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./

COPY . .

RUN npm ci --legacy-peer-deps

RUN npm run build

FROM node:22-alpine

WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

ENV PORT=3004
ENV HOSTNAME="0.0.0.0"

EXPOSE 3004

CMD ["node", "server.js"]