FROM node:20-alpine AS frontend-build
WORKDIR /frontend
COPY secondChance-frontend/package*.json ./
RUN npm ci
COPY secondChance-frontend/ ./
RUN npm run build

FROM node:20-alpine
ENV NODE_ENV=production
WORKDIR /app/secondChance-backend
COPY secondChance-backend/package*.json ./
RUN npm ci --omit=dev
COPY secondChance-backend/ ./
COPY --from=frontend-build /frontend/build /app/secondChance-frontend/build
EXPOSE 3060
HEALTHCHECK --interval=30s --timeout=3s --start-period=15s --retries=3 CMD node -e "fetch('http://127.0.0.1:3060/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "app.js"]