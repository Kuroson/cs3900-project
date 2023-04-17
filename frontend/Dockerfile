FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package.json /app
COPY yarn.lock /app
RUN yarn install --frozen-lockfile

# Copy source files
COPY . /app

EXPOSE 3000

ENTRYPOINT yarn run dev