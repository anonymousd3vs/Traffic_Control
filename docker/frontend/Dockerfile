# Multi-stage Dockerfile for Traffic Control Frontend
# Stage 1: Build
FROM node:18-alpine as builder

WORKDIR /build

# Copy package files
COPY dashboard/frontend/package.json dashboard/frontend/package-lock.json ./

# Install dependencies
RUN npm ci --no-audit --no-fund

# Copy source code
COPY dashboard/frontend/src ./src
COPY dashboard/frontend/public ./public
COPY dashboard/frontend/vite.config.js dashboard/frontend/postcss.config.js dashboard/frontend/tailwind.config.js ./
COPY dashboard/frontend/index.html ./

# Build application
ENV VITE_API_URL=http://localhost:8765
RUN npm run build

# Stage 2: Production
FROM nginx:alpine

# Copy custom nginx configuration
COPY docker/frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Copy built application from builder
COPY --from=builder /build/dist /usr/share/nginx/html

# Create non-root user
RUN adduser -D -g '' -u 1000 appuser && \
    chown -R appuser:appuser /usr/share/nginx/html && \
    chown -R appuser:appuser /var/cache/nginx && \
    chown -R appuser:appuser /var/log/nginx && \
    touch /var/run/nginx.pid && \
    chown appuser:appuser /var/run/nginx.pid

USER appuser

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:3000/ || exit 1

# Expose port
EXPOSE 3000

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
