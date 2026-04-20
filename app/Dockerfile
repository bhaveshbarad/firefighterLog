# Metro web dev server. Open http://localhost:8081 on the host (browser talks to API at localhost:3000).
FROM node:20-bookworm-slim

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install

COPY . .

EXPOSE 8081

ENV CI=1
ENV EXPO_NO_TELEMETRY=1
ENV BROWSER=none
ENV EXPO_PUBLIC_API_URL=http://localhost:3000

# Expo only accepts --host lan|tunnel|localhost (not 0.0.0.0). "lan" binds for access via published port.
CMD ["npx", "expo", "start", "--web", "--host", "lan", "--port", "8081"]
