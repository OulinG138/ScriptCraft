#!/bin/bash

# Start the Next.js application

echo "Starting Docker Daemon..."
sudo service docker start

echo "Starting the Next.js application..."
npm run dev
