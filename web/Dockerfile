FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
# install dependencies with unsafe-perm to avoid permission issues in alpine
RUN npm ci --unsafe-perm
COPY . .
# ensure local binaries are executable (vite in node_modules/.bin)
RUN if [ -d ./node_modules/.bin ]; then chmod -R a+rx ./node_modules/.bin || true; fi
# make sure esbuild and other native bins are executable (fix EACCES)
RUN if [ -d ./node_modules/@esbuild ]; then chmod -R a+rx ./node_modules/@esbuild || true; fi
RUN find ./node_modules -type f -perm /u=x,g=x,o=x -print || true
# Создаем .env файл с настройками для Docker контейнера (указывает на API сервис внутри docker-сети)
RUN echo "VITE_API_URL=http://api:3001" > .env
EXPOSE 3000
EXPOSE 5173
# Run Vite CLI directly to avoid issues with .bin import paths inside container  
# Vite dev server теперь на порту 5173 с HMR поддержкой
CMD ["node", "./node_modules/vite/dist/node/cli.js", "--host", "0.0.0.0", "--port", "5173"]