FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy app source
COPY . .

# Create uploads directory
RUN mkdir -p uploads && chown -R node:node uploads

# Expose port
EXPOSE 3001

# Start the server
USER node
CMD ["npm", "start"]
