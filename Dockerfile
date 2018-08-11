FROM node:alpine
LABEL maintainer="zahir.gudino@gmail.com"
LABEL version="1.0.0"
LABEL description="Contenedor esencial de @bazzer/arii"
# Directorio de Trabajo
WORKDIR /app
# Copiar todo, excluyendo contenido en .dockerignore, a /app
ADD . /app
# Instalar dependencias productivas, no devs
RUN npm install --only=production
