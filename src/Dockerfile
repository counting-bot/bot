FROM node:20.2-alpine3.16
ENV NODE_ENV production

WORKDIR /app

COPY . /app

RUN apk update && \
    apk add --update git && \
    apk add --update openssh

RUN npm install --force

CMD ["node", "index.mjs"]
