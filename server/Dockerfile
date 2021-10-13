FROM node:latest

RUN mkdir -p /usr/src/app

WORKDIR /usr/src/app

COPY package.json /usr/src/app/

RUN npm install --production

RUN npm install nodemon@latest -g

COPY . /usr/src/app

EXPOSE 8080 6379

CMD [ "npm", "start" ]