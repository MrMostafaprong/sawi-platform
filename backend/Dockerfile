FROM node:20-alpine AS runner

WORKDIR /app

RUN apk add --no-cache openssl

COPY package*.json ./
RUN npm ci

COPY . .

RUN npx prisma generate

EXPOSE 8000

CMD ["npx", "tsx", "src/server.ts"]
