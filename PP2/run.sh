#!/bin/bash

# Start the Next.js application

echo "Starting Docker Daemon..."
sudo systemctl start docker

echo "Starting the Next.js application..."
npm run dev

sudo systemctl stop docker
