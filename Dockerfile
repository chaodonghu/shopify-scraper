FROM node:17-alpine3.12

RUN mkdir -p /app

WORKDIR /app

COPY build ./build
COPY public ./public
COPY package.json .

RUN yarn install --frozen-lockfile --production

EXPOSE 4500

ENTRYPOINT ["node", "build/index.js"]
