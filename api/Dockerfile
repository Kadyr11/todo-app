# ---------- builder ----------
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

# copy prisma early
COPY prisma ./prisma

COPY tsconfig*.json ./
COPY src ./src

# generate prisma client
RUN npx prisma generate

# build ts
RUN npx tsc -b

# ---------- runtime ----------
FROM node:20-alpine AS runtime
WORKDIR /app

# OS deps
RUN apk add --no-cache openssl wget

# copy package and install production deps only
COPY package*.json ./
RUN npm ci --omit=dev

# copy built artifacts
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

# copy generated prisma client artifacts
RUN mkdir -p node_modules
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/node_modules/@prisma/client ./node_modules/@prisma/client
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# entrypoint
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Set ownership to node user
RUN chown -R node:node /app

ENV NODE_ENV=production
EXPOSE 3001

# run as non-root
USER node

ENTRYPOINT ["sh", "/usr/local/bin/docker-entrypoint.sh"]
CMD ["node", "dist/src/index.js"]