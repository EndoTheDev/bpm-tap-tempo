# bpm tap tempo - build for production (arm64 on the Pi)
# npm install, not npm ci - no lockfile is committed (the Pi has no node
# toolchain; camelot-wheel proved this pattern). standalone output = slim image.
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]