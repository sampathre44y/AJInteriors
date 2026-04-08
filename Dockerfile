FROM node:20-alpine AS build

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source code and build
COPY . .
RUN npm run build

# Production environment
FROM node:20-alpine

WORKDIR /app

# Install serve to run the application
RUN npm install -g serve

# Copy built assets from the build stage
COPY --from=build /app/dist ./dist

# Cloud Run sets the PORT environment variable automatically (default is 8080)
ENV PORT=8080
EXPOSE 8080

# Start the server, listening on the PORT environment variable
CMD ["sh", "-c", "serve -s dist -l tcp://0.0.0.0:${PORT}"]
