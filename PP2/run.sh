#!/bin/bash

# Start the Next.js application

echo "Starting Docker Daemon..."
sudo dockerd &

echo "Starting the Next.js application..."
npm run dev

sudo systemctl stop docker
