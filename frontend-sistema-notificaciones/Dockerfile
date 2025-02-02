# Usa una imagen de Node.js como base
FROM node:alpine

ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# Establece el directorio de trabajo
WORKDIR /app

# Copia los archivos de la aplicación
COPY . .

# Instala las dependencias
RUN npm install

# Construye la aplicación
RUN npm run build

# Expone el puerto 3000
EXPOSE 3000

# Inicia la aplicación Next.js
CMD ["npm", "start"]