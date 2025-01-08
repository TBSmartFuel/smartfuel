#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

echo "🏗️ Building Production Frontend..."

# Check if .env.production exists
if [ ! -f .env.production ]; then
    echo -e "${RED}Error: .env.production file not found${NC}"
    echo "Creating .env.production from example..."
    cp .env.example .env.production || { echo "Failed to create .env.production"; exit 1; }
fi

# Clean previous build
echo -e "\n${GREEN}Cleaning previous build...${NC}"
rm -rf build

# Install dependencies
echo -e "\n${GREEN}Installing dependencies...${NC}"
npm ci --only=production || { echo -e "${RED}Failed to install dependencies${NC}"; exit 1; }

# Build the application
echo -e "\n${GREEN}Building application...${NC}"
npm run build || { echo -e "${RED}Build failed${NC}"; exit 1; }

# Test the build
echo -e "\n${GREEN}Testing build...${NC}"
if [ -d "build" ] && [ -f "build/index.html" ]; then
    echo "✅ Build successful!"
else
    echo -e "${RED}❌ Build verification failed${NC}"
    exit 1
fi

# Build Docker image
echo -e "\n${GREEN}Building Docker image...${NC}"
docker build -t smartfuel-frontend:prod . || { echo -e "${RED}Docker build failed${NC}"; exit 1; }

echo -e "\n${GREEN}Production build completed successfully!${NC}" 