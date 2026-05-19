FROM node:24-alpine

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install

RUN npm install -g @expo/ngrok@4.1.0

COPY . .

EXPOSE 8081

CMD ["npx", "expo", "start", "--tunnel"]