FROM node:20 AS deps
WORKDIR /app
# copy project early so prisma schema is present when generating client
COPY . .

# install system utilities prisma may need to fetch native engines
RUN apt-get update -y && apt-get install -y curl ca-certificates xz-utils --no-install-recommends && rm -rf /var/lib/apt/lists/*

# install all dependencies (including dev) and avoid permission issues
RUN npm ci --unsafe-perm

# ensure binaries in node_modules are executable (fixes "prisma: Permission denied")
RUN if [ -d ./node_modules/.bin ]; then chmod -R a+rx ./node_modules/.bin || true; fi

# generate Prisma client
RUN npx prisma generate

# build the project
RUN npm run build
RUN ls -la dist/

FROM node:20-slim
WORKDIR /app
RUN apt-get update -y && apt-get install -y openssl curl ca-certificates --no-install-recommends && rm -rf /var/lib/apt/lists/*
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/dist ./dist
COPY --from=deps /app/prisma ./prisma
COPY package*.json ./
ENV NODE_ENV=production
EXPOSE 3001
CMD ["node", "dist/src/index.js"]