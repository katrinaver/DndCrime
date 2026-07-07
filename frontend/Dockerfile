FROM node:20-alpine AS builder

WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --ignore-engines

ARG VITE_GOOGLE_CLIENT_ID=
ARG VITE_DEV_AUTH_STUB=false
ARG VITE_DEV_AUTH_ALLOW_BUILD=false

ENV VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID
ENV VITE_DEV_AUTH_STUB=$VITE_DEV_AUTH_STUB
ENV VITE_DEV_AUTH_ALLOW_BUILD=$VITE_DEV_AUTH_ALLOW_BUILD

COPY . .
RUN yarn build

FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
