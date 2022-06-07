FROM node:18-alpine

WORKDIR /opt/app

ENV PORT=80

COPY package*.json ./

RUN npm install --production

COPY . .

CMD npm start
