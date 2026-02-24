FROM node:18-alpine

WORKDIR /app

# install deps
COPY package.json package-lock.json* ./
RUN npm install --production --silent || true

# copy source
COPY . .

# build
RUN npm run build || true

ENV NODE_ENV=production
EXPOSE 3000

CMD ["node", "dist/index.js"]
