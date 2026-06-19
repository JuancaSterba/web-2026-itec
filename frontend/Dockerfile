# Usamos una imagen ligera de Node.js
FROM node:22-alpine

# Habilitamos corepack para poder usar pnpm sin tener que instalarlo manualmente
RUN corepack enable && corepack prepare pnpm@latest --activate

# Establecemos el directorio de trabajo
WORKDIR /app

# Copiamos los archivos de dependencias
COPY package.json package-lock.json* pnpm-lock.yaml* ./

# Instalamos las dependencias usando pnpm
RUN pnpm install --ignore-scripts

# Copiamos el resto del código
COPY . .

# Exponemos el puerto por defecto de Next.js
EXPOSE 3000

# Comando para iniciar en modo desarrollo
CMD ["pnpm", "run", "dev"]
