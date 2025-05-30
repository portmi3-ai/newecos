FROM node:18-alpine

WORKDIR /app/backend

# Copy backend package files
COPY backend/package.json ./
COPY backend/package-lock.json ./

# Install backend dependencies
RUN npm ci --only=production

# Copy backend source
COPY backend ./
COPY ../.env.example ./.env

# Set environment variables
ENV NODE_ENV=production
ENV PORT=8080

# Expose port
EXPOSE 8080

# Start the server
CMD ["node", "server.js"]