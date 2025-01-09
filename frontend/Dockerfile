# Build stage
FROM node:18-alpine as build

WORKDIR /app

# Copy package files
COPY package.json ./

# Install dependencies without using package-lock.json
RUN npm install

# Copy source code
COPY . .

# Set production environment
ENV NODE_ENV=production
# API URL will be set by docker-compose
ENV REACT_APP_API_URL=${REACT_APP_API_URL}

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

# Install curl and bash for healthcheck and scripts
RUN apk add --no-cache curl bash

# Create directory for nginx pid file
RUN mkdir -p /run/nginx

# Copy built assets from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Create a simple health check script
RUN echo -e '#!/bin/sh\n\
curl -f http://localhost/health || exit 1' > /healthcheck.sh && \
    chmod +x /healthcheck.sh

HEALTHCHECK --interval=10s --timeout=5s --start-period=30s --retries=3 \
    CMD /healthcheck.sh

EXPOSE 80

# Start nginx in foreground
CMD ["nginx", "-g", "daemon off;"] 