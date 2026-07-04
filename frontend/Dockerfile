# Etapa 1: Dependencias
# Copiamos solo los manifiestos primero para aprovechar la cache de Docker:
# si package.json no cambia, esta capa (la mas lenta) no se vuelve a ejecutar.
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
# --legacy-peer-deps: react-use@13 pide react@^16 como peer, pero el proyecto
# usa react@18. El Dockerfile anterior evitaba esto usando pnpm (mas laxo con
# peers); con npm hay que ser explicito o "npm install" falla directamente.
RUN npm install --legacy-peer-deps

# Etapa 2: Build
# Compilamos con el codigo fuente completo sobre los node_modules ya instalados.
FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Etapa 3: Produccion
# Imagen final liviana: solo lo necesario para correr "next start"
# (sin el codigo fuente ni las devDependencies de build).
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000

CMD ["npm", "start"]
