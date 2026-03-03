# ─── build the backend ──────────────────────────────────
FROM node:18-alpine AS backend-build
WORKDIR /app/backend

# copy only what’s needed for npm install so layer can be cached
COPY backend/package*.json backend/yarn.lock ./
RUN npm ci

COPY backend/ .
RUN npm run build    # if you have a build step, else omit

# ─── build the frontend ─────────────────────────────────
FROM node:18-alpine AS frontend-build
WORKDIR /app/frontend

COPY frontend/package*.json frontend/yarn.lock ./
RUN npm ci

COPY frontend/ .
RUN npm run build     # produces e.g. ./build or ./dist

# ─── final image (tiny production runtime) ─────────────
FROM node:18-alpine AS runtime
WORKDIR /app

# copy backend source & deps
COPY --from=backend-build /app/backend ./

# serve the frontend static bundle from backend (assumes backend is configured to do so)
COPY --from=frontend-build /app/frontend/build ./public

# expose port and set env defaults
ENV NODE_ENV=production
EXPOSE 5000

# if you use a custom start script:
CMD ["node", "src/server.js"]