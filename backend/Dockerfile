# Backend service
FROM node:22-alpine

# Set working directory
WORKDIR /app

# Keep base OS packages patched
RUN apk upgrade --no-cache

# Configure npm to be resilient to registry hiccups and allow registry override
ARG NPM_REGISTRY=https://registry.npmjs.org/
ENV \
  NPM_CONFIG_REGISTRY=${NPM_REGISTRY} \
  NPM_CONFIG_FETCH_RETRIES=5 \
  NPM_CONFIG_FETCH_RETRY_MINTIMEOUT=20000 \
  NPM_CONFIG_FETCH_RETRY_MAXTIMEOUT=120000 \
  NPM_CONFIG_AUDIT=false \
  NPM_CONFIG_FUND=false

# Install dependencies first (better layer caching)
COPY package*.json ./
# Use lockfile-based install for determinism and speed
RUN npm ci

# Copy the rest of the backend source
COPY . .

# Provide a default SQLite URL for Prisma during image build
ENV DATABASE_URL=file:./dev.db

# Generate Prisma client (needed after schema changes)
RUN npx prisma generate && npm prune --omit=dev && npm cache clean --force

# Expose backend port
EXPOSE 4003

# Start the backend server
CMD ["npm", "run", "dev"]
