FROM node:16

WORKDIR /usr/src/app

ARG REACT_APP_THEME_COLOR
ARG REACT_APP_HOST
ARG REACT_APP_TLS

COPY server server
RUN cd server && npm ci && npm run build
COPY client client
RUN cd client && npm ci && REACT_APP_THEME_COLOR=$REACT_APP_THEME_COLOR REACT_APP_HOST=$REACT_APP_HOST REACT_APP_TLS=$REACT_APP_TLS npm run build

EXPOSE 8080

ENV NODE_ENV=production

CMD cd server && node build/index.js