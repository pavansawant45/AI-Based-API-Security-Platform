# ============================================================
# Gateway Dockerfile
# ============================================================
# Multi-stage build for the Express API Security Gateway.
# Uses Node.js 18 Alpine for a minimal production image.
# ============================================================

FROM node:18-alpine

# Set working directory inside the container
WORKDIR /app

# Copy dependency manifests first (Docker layer caching optimization)
COPY package.json package-lock.json* ./

# Install production dependencies
RUN npm install --production

# Copy application source code
COPY . .

# Expose the gateway port
EXPOSE 3000

# Start the gateway server
CMD ["node", "src/index.js"]
