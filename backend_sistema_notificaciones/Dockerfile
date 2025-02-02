# Usa una imagen de Node.js como base
FROM node:alpine

# Define argumentos que pueden ser pasados durante la construcción
ARG DB_USERNAME
ARG DB_PASSWORD
ARG DB_DATABASE
ARG DB_HOST
ARG DB_PORT
ARG DB_DIALECT
ARG DB_OPERATOR_ALIASES
ARG NODE_ENV
ARG KEY_SQ
ARG LOGIC_APPS_URL

# Establece las variables de entorno usando los argumentos
ENV DB_USERNAME=${DB_USERNAME}
ENV DB_PASSWORD=${DB_PASSWORD}
ENV DB_DATABASE=${DB_DATABASE}
ENV DB_HOST=${DB_HOST}
ENV DB_PORT=${DB_PORT}
ENV DB_DIALECT=${DB_DIALECT}
ENV DB_OPERATOR_ALIASES=${DB_OPERATOR_ALIASES}
ENV NODE_ENV=${NODE_ENV}
ENV KEY_SQ=${KEY_SQ}
ENV LOGIC_APPS_URL=${LOGIC_APPS_URL}

# Establece el directorio de trabajo
WORKDIR /app

# Copia los archivos de la aplicación
COPY . .

# Instala las dependencias
RUN npm install
# Expone el puerto en el que correrá el servidor
EXPOSE 8000

# Comando para ejecutar la aplicación
CMD ["npm", "start"]