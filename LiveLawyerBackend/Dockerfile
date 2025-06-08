# Stage 1: Build both the library and the backend
FROM node:20-alpine AS builder

WORKDIR /app

# ---- Build LiveLawyerLibrary ----
COPY LiveLawyerLibrary/package*.json ./LiveLawyerLibrary/
WORKDIR /app/LiveLawyerLibrary
RUN npm install
COPY LiveLawyerLibrary/ ./
RUN npx tsc
# Prune the library's dev dependencies to get a lean node_modules for production
RUN npm prune --production

# ---- Build LiveLawyerBackend ----
WORKDIR /app
COPY LiveLawyerBackend/package*.json ./LiveLawyerBackend/
WORKDIR /app/LiveLawyerBackend
RUN npm install
COPY LiveLawyerBackend/prisma/schema.prisma ./prisma/
RUN npx prisma generate
COPY LiveLawyerBackend/ ./
RUN npx tsc
RUN npm prune --production


# ---

# Stage 2: Create the final, lean production image
FROM node:20-alpine

WORKDIR /usr/src/app

# Create a non-root user for better security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy the backend's compiled code and pruned production node_modules from the builder stage
COPY --from=builder /app/LiveLawyerBackend/dist ./dist
COPY --from=builder /app/LiveLawyerBackend/node_modules ./node_modules

# Copy the flattened, compiled library code into the backend's node_modules
COPY --from=builder /app/LiveLawyerLibrary/dist/ ./node_modules/livelawyerlibrary/
COPY --from=builder /app/LiveLawyerLibrary/package.json ./node_modules/livelawyerlibrary/package.json

# --- THE FIX ---
# Copy the library's OWN pruned production dependencies into its folder.
# This makes packages like 'dotenv' available to the library's code.
COPY --from=builder /app/LiveLawyerLibrary/node_modules/ ./node_modules/livelawyerlibrary/node_modules/
# --- END FIX ---

# Create a directory for recordings and set ownership for the entire app directory
RUN mkdir recordings && chown -R appuser:appgroup /usr/src/app

# Switch to the non-root user
USER appuser

# Expose the port the app runs on
EXPOSE 3001

# Command to run the application
CMD [ "node", "dist/index.js" ]