    # Use the official Node.js 18 image as a base
    FROM node:18

    # Set the working directory
    WORKDIR /app

    # Copy package.json and package-lock.json into the container
    COPY package*.json ./

    # Install application dependencies
    RUN npm install

    # Copy the rest of the application code
    COPY . .

    # Build the application
    RUN npm run build

    # Inform Docker that the container listens on port 3000
    EXPOSE 3000

    # Run the application
    CMD [ "node", "dist/main" ]