FROM node:18-alpine AS build

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

ARG API_URL=http://localhost:3000

RUN sed -i "s|\${API_URL}|${API_URL}|g" src/environments/environment.prod.ts

RUN npm run build -- --configuration=production


FROM nginx:alpine

COPY --from=build /app/dist/fullstack/browser /usr/share/nginx/html

COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
