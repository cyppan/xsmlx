FROM node:16

WORKDIR /usr/src/app

COPY server server
RUN cd server && npm ci && npm run build
COPY client client
RUN cd client && npm ci && npm run build

EXPOSE 8080

ENV NODE_ENV=production
CMD cd server && node build/index.js