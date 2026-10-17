FROM node:20-alpine AS build
WORKDIR /frontend
COPY package*.json ./
RUN npm ci
COPY . ./
ARG REACT_APP_BACKEND_URL
ENV REACT_APP_BACKEND_URL=${REACT_APP_BACKEND_URL}
RUN test -n "$REACT_APP_BACKEND_URL" && npm run build

FROM nginx:stable-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /frontend/build /usr/share/nginx/html
EXPOSE 9000
