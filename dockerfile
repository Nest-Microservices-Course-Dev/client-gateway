FROM node:22-alpine
WORKDIR /usr/src/app
RUN apk add --no-cache python3 make g++
COPY package.json ./
COPY yarn.lock ./
RUN yarn install
COPY . .
EXPOSE 3000
CMD [ "yarn", "start:dev" ]
#