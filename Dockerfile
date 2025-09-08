# Use Node LTS
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --omit=dev

# Copy the rest of your app
COPY . .

# Expose port your app runs on
EXPOSE 8080

# Start the app
CMD ["node", "server.js"]
