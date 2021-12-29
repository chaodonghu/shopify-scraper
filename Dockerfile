FROM node:14.5.0-alpine
RUN mkdir /app
WORKDIR /app
COPY package.json /app/
RUN yarn install
ADD . /app/
