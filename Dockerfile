# Keep this tag in step with the @playwright/test version in package.json
FROM mcr.microsoft.com/playwright:v1.64.1

WORKDIR /app

ENV CI=true

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

CMD ["npx", "playwright", "test", "--project=chromium"]
