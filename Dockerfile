# Pull latest node image
FROM node:alpine

# Permissions
RUN addgroup -S appgroup && adduser -S -G appgroup appuser
USER appuser

# Labels
LABEL org="ntnui-sprint"
LABEL project="ntnui-membership-bot"

# Set working directory
WORKDIR /app

# Optional, for future use
VOLUME [ "/app/config" ] 

# Copy package.json and package-lock.json first to leverage Docker cache
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the application code
COPY . .

# Run the bot!
CMD [ "npm", "start" ]