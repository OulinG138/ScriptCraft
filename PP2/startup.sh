#!/bin/bash

# Function to check if a command exists and install if missing
check_and_install_command() {
  if ! command -v "$1" &>/dev/null; then
    echo "$1 is not installed. Installing now..."
    sudo apt-get install -y "$2"
  else
    echo "$1 is already installed."
  fi
}

# Install Node.js and npm if not installed
install_node_ubuntu() {
  echo "Installing Node.js and npm..."

  # Update package list
  sudo apt-get update

  # Install Node.js and npm
  sudo apt-get install -y nodejs npm

  echo "Node.js and npm installed successfully."
}

create_docker_images()  {
  cd docker_images/

  for dir in */
  do
      dir=${dir::-1}
      echo "installing" $dir "image..."
      cd $dir 
      docker build -t $dir .
      cd ..
      echo $dir "image installed successfully."
  done
  cd ..
}

# Check if Node.js is installed, and install it if not
if ! command -v node &>/dev/null; then
  echo "Node.js is not installed. Installing now..."
  install_node_ubuntu
else
  echo "Node.js is already installed."
fi

if ! command -v docker &>/dev/null; then
  echo "docker is not installed. Installing now..."
  sudo apt-get install ./docker-desktop-amd64.deb
  echo "docker installed successfully."
else
  echo "docker is already installed."
fi

sudo dockerd &

create_docker_images

# Install Prisma dependencies
echo "Checking for Prisma..."

if ! command -v npx &>/dev/null || ! npx prisma -v &>/dev/null; then
  echo "Prisma is not installed. Installing Prisma..."
  npm install prisma --save-dev
fi

echo "All required compilers and interpreters are installed."

# Install project dependencies
echo "Installing project dependencies..."
npm install

# Reset Prisma migrations if necessary
echo "Resetting Prisma migrations..."
npx prisma migrate reset --force --schema=../prisma/schema.prisma

# Run migrations
echo "Running Prisma migrations..."
npx prisma migrate dev --name init --schema=../prisma/schema.prisma

# Generate Prisma Client
echo "Generating Prisma client..."
npx prisma generate --schema=../prisma/schema.prisma

# Run seed script
echo "Running seed script..."
npx tsx ../prisma/seed.ts

sudo systemctl stop docker

# Final check
echo "Project setup complete. You can now start the server using run.sh"
