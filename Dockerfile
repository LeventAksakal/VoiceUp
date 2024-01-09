# Use an official Node.js runtime as the base image
FROM node:14

# Set the working directory in the container to /app
WORKDIR /app

# Copy the rest of the server code to the server directory
COPY VoiceUpServer/ ./VoiceUpServer/

# Install the application dependencies
RUN npm install --prefix ./VoiceUpServer

# Copy the rest of the client code to the client directory
COPY VoiceUpClient/ ./VoiceUpClient/

# Install the application dependencies
RUN npm install --prefix ./VoiceUpClient && npm run build --prefix ./VoiceUpClient

# Expose port 3000 for the application
EXPOSE 3000

# Define the command to run the application
CMD [ "node", "VoiceUpServer/server.js" ]