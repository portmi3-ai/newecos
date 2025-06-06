# Backend Dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install
RUN ls -l node_modules && npm list --depth=0

COPY . .

EXPOSE 3000
CMD ["npm", "run", "start"] 