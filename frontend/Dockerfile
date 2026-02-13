# Frontend service - build stage
FROM node:22-alpine AS build

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Build-time API URL for Vite (optional build arg)
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}

# Build static assets
RUN npm run build

# Frontend service - runtime stage
FROM nginx:stable-alpine

# Keep runtime OS packages patched
RUN apk upgrade --no-cache

# Copy built assets into Nginx html directory
COPY --from=build /app/dist /usr/share/nginx/html

# Custom Nginx config: serve SPA + proxy /api vers le backend Kubernetes
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
