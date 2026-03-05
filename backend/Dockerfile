# Base image
FROM node:20-alpine AS base
RUN apk add --no-cache openssl libc6-compat
WORKDIR /usr/src/app

# Development stage
FROM base AS development
COPY package*.json ./
RUN npm install
COPY . .
# Start dev server
CMD ["npm", "run", "dev"]

# Production build stage
FROM base AS builder
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build

# Production stage
FROM base AS production
ENV NODE_ENV=production
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/dist ./dist
COPY package*.json ./
EXPOSE 3001
CMD ["npm", "start"]
