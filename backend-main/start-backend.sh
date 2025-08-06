#!/bin/bash
echo "🚀 Starting INBOLA Backend Server..."
cd /home/zufar/Documents/marketplace/backend-main
export NODE_ENV=development
export PORT=4000
npx ts-node src/simple-main.ts
