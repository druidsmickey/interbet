FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci --only=production

COPY . .

RUN addgroup -g 1001 -S nodejs && \
    adduser -S backend -u 1001

RUN chown -R backend:nodejs /app
USER backend

EXPOSE 3000

CMD ["node", "server.js"]
