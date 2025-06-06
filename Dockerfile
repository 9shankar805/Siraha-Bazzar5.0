# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY client/package*.json ./client/

# Install dependencies
RUN npm install
RUN cd client && npm install

# Copy source code
COPY . .

# Build client
RUN cd client && npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy built client files
COPY --from=builder /app/client/dist ./client/dist

# Copy server files
COPY package*.json ./
COPY server ./server
COPY tsconfig.json ./

# Install production dependencies
RUN npm install --production

# Expose port
EXPOSE 5000

# Start the application
CMD ["npm", "start"] 