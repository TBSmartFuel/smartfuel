#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

echo "🚀 Testing Frontend Docker Setup..."

# Test 1: Build the image
echo -e "\n${GREEN}Test 1: Building Docker image${NC}"
docker build -t smartfuel-frontend . || { echo -e "${RED}Build failed${NC}"; exit 1; }

# Test 2: Run the container
echo -e "\n${GREEN}Test 2: Running container${NC}"
CONTAINER_ID=$(docker run -d -p 3000:80 smartfuel-frontend)
sleep 5  # Wait for container to start

# Test 3: Check if container is running
echo -e "\n${GREEN}Test 3: Checking container status${NC}"
if docker ps | grep $CONTAINER_ID; then
    echo "Container is running"
else
    echo -e "${RED}Container failed to start${NC}"
    docker logs $CONTAINER_ID
    exit 1
fi

# Test 4: Check if nginx is serving content
echo -e "\n${GREEN}Test 4: Testing nginx response${NC}"
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000)
if [ $RESPONSE -eq 200 ]; then
    echo "Nginx is serving content (HTTP 200)"
else
    echo -e "${RED}Nginx test failed (HTTP $RESPONSE)${NC}"
    docker logs $CONTAINER_ID
    exit 1
fi

# Test 5: Check nginx configuration
echo -e "\n${GREEN}Test 5: Testing nginx configuration${NC}"
docker exec $CONTAINER_ID nginx -t

# Test 6: Test API proxy
echo -e "\n${GREEN}Test 6: Testing API proxy${NC}"
PROXY_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/health)
echo "API proxy response code: $PROXY_RESPONSE"

# Cleanup
echo -e "\n${GREEN}Cleaning up${NC}"
docker stop $CONTAINER_ID
docker rm $CONTAINER_ID

echo -e "\n${GREEN}Tests completed!${NC}" 