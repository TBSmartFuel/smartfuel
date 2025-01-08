#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

echo "🧪 Testing Production Build..."

# Test 1: Check production build
echo -e "\n${GREEN}Test 1: Verifying production build${NC}"
if [ ! -d "build" ]; then
    echo -e "${RED}Build directory not found${NC}"
    exit 1
fi

# Test 2: Check main assets
echo -e "\n${GREEN}Test 2: Checking build assets${NC}"
required_files=("build/index.html" "build/static/js" "build/static/css")
for file in "${required_files[@]}"; do
    if [ ! -e "$file" ]; then
        echo -e "${RED}Missing required file: $file${NC}"
        exit 1
    fi
done

# Test 3: Run production container
echo -e "\n${GREEN}Test 3: Testing production container${NC}"
CONTAINER_ID=$(docker run -d -p 8080:80 smartfuel-frontend:prod)
sleep 5

# Test 4: Check if production server is responding
echo -e "\n${GREEN}Test 4: Checking server response${NC}"
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8080)
if [ $RESPONSE -eq 200 ]; then
    echo "✅ Server is responding correctly"
else
    echo -e "${RED}❌ Server response failed: $RESPONSE${NC}"
    docker logs $CONTAINER_ID
    docker stop $CONTAINER_ID
    docker rm $CONTAINER_ID
    exit 1
fi

# Cleanup
docker stop $CONTAINER_ID
docker rm $CONTAINER_ID

echo -e "\n${GREEN}Production tests completed successfully!${NC}" 