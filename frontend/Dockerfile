# Base image
FROM node:20-alpine AS base
WORKDIR /usr/src/app

# Development stage
FROM base AS development
COPY package*.json ./
# If packages don't exist yet, we'll create them later
RUN if [ -f "package.json" ]; then npm install; fi
COPY . .
# Start dev server
CMD ["npm", "run", "dev"]

# Production build stage
FROM base AS builder
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM node:20-alpine AS production
WORKDIR /usr/src/app
ENV NODE_ENV=production
COPY --from=builder /usr/src/app/public ./public
COPY --from=builder /usr/src/app/.next/standalone ./
COPY --from=builder /usr/src/app/.next/static ./.next/static
EXPOSE 3000
CMD ["node", "server.js"]
