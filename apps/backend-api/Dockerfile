FROM node:18-alpine

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml ./
COPY packages ./packages
COPY apps/backend-api ./apps/backend-api

# Install dependencies
RUN pnpm install --frozen-lockfile

# Build shared packages
WORKDIR /app/packages/shared
RUN pnpm run build 2>/dev/null || true

# Set working directory back
WORKDIR /app/apps/backend-api

# Expose port
EXPOSE 4000

# Start server
CMD ["node", "src/index.js"]
