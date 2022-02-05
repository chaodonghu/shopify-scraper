FROM node:17-alpine3.12

RUN mkdir -p /app

WORKDIR /app

COPY package.json .

RUN yarn install --frozen-lockfile --production

COPY . .

EXPOSE 4500
