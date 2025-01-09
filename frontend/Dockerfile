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
# Use Railway's auto-generated URL
ENV REACT_APP_API_URL=https://smartfuel-backend.up.railway.app

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

# Install wget for healthcheck
RUN apk add --no-cache wget

# Copy built assets from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Add healthcheck with longer intervals and more retries
HEALTHCHECK --interval=15s --timeout=15s --start-period=120s --retries=10 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:80/health || exit 1

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"] 