FROM node:20@sha256:e391c5561646193be929e3fe55d27234f40a01d867d72b30ae1341b673a3bf4b

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000

CMD ["node", "src/server.js"]
