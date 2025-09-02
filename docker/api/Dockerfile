# Stage 1: Build
FROM node:18-alpine AS builder
WORKDIR /app
COPY backend-main/package*.json ./
RUN npm ci
COPY backend-main .
RUN npm run build

# Stage 2: Production
FROM node:18-alpine
WORKDIR /app
ENV NODE_ENV production
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY backend-main/package.json .
COPY backend-main/prisma ./prisma

# Install Prisma and runtime dependencies
RUN npm install --omit=dev
RUN npx prisma generate

EXPOSE 3001
CMD ["npm", "run", "start:prod"]