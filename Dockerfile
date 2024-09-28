# Dockerfile for Vite frontend

# Use an official Node.js runtime as a parent image
FROM node:18

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code into the container
COPY . .

# Build the app for production
RUN npm run build

# Install a simple HTTP server
RUN npm install -g serve

# Serve the app
CMD ["serve", "-s", "dist", "-l", "5000"]

# Expose port 5000
EXPOSE 5000
