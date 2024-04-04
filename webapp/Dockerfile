ARG NODE_VERSION=lts-alpine3.18@sha256:acdf232a7bf5d32e2212134d50aee7deb9193908f1172e56fc865c51b0c6bfb0

FROM node:$NODE_VERSION as base
WORKDIR /app

FROM base as builder
COPY yarn.lock .yarnrc.yml ./
COPY .yarn .yarn
RUN yarn fetch

ARG NEXT_PUBLIC_ENV_APP
ENV NEXT_PUBLIC_ENV_APP=$NEXT_PUBLIC_ENV_APP
ARG NEXT_PUBLIC_JWT_NAME
ENV NEXT_PUBLIC_JWT_NAME=$NEXT_PUBLIC_JWT_NAME
ARG NEXT_PUBLIC_MATOMO_URL
ENV NEXT_PUBLIC_MATOMO_URL=$NEXT_PUBLIC_MATOMO_URL
ARG NEXT_PUBLIC_MATOMO_SITE_ID
ENV NEXT_PUBLIC_MATOMO_SITE_ID=$NEXT_PUBLIC_MATOMO_SITE_ID
ARG NEXT_PUBLIC_MATOMO_TRACKING_ENABLED
ENV NEXT_PUBLIC_MATOMO_TRACKING_ENABLED=$NEXT_PUBLIC_MATOMO_TRACKING_ENABLED
ARG NEXT_PUBLIC_CRISP_TOKEN
ENV NEXT_PUBLIC_CRISP_TOKEN=$NEXT_PUBLIC_CRISP_TOKEN
ARG NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY
ENV NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY=$NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY

COPY . .
RUN --mount=type=secret,id=sentry_auth_token export SENTRY_AUTH_TOKEN="$(cat /run/secrets/sentry_auth_token)"; \
  yarn build


# prepare runtime dependencies
RUN yarn workspaces focus --production

FROM base as runner
ARG PRODUCTION
ENV NODE_ENV production

COPY --from=builder --chown=node:node /app/node_modules ./node_modules
COPY --from=builder --chown=node:node /app/package.json .
COPY --from=builder --chown=node:node /app/next.config.js .
COPY --from=builder --chown=node:node /app/public ./public
COPY --from=builder --chown=node:node /app/src ./src
COPY --from=builder --chown=node:node /app/.next ./.next

# Block crawlers for staging deployments
RUN if [ -z "$PRODUCTION" ]; then mv -f public/robots.staging.txt public/robots.txt; \
  else rm -f public/robots.staging.txt; fi

USER 1000

EXPOSE 3000
ENV PORT 3000
CMD ["yarn", "start"]
