FROM node:24-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .

RUN npm run build


FROM dhi.io/nginx:1.31

COPY --from=builder /app/dist/label-verifier/browser /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["-g", "daemon off;"]
