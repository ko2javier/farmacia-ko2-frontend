# --- ETAPA 1: CONSTRUCCIÓN (BUILD) ---
# Usamos una imagen de Node para fabricar la app
FROM node:20-alpine AS build

# Creamos una carpeta de trabajo
WORKDIR /app

# Copiamos los archivos de dependencias
COPY package*.json ./

# Instalamos las librerías (esto tarda un poco la primera vez)
RUN npm install

# Copiamos TODO el código fuente de tu proyecto
COPY . .

# Construimos la aplicación (genera la carpeta dist automáticamente)
RUN npm run build -- --configuration=production

# --- ETAPA 2: SERVIDOR (RUN) ---
# Usamos Nginx para servir lo que acabamos de fabricar
FROM nginx:alpine

# Copiamos tu configuración de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# COPIAMOS LA CARPETA GENERADA EN LA ETAPA 1
# Docker coge lo que fabricó arriba y lo mete en el servidor
COPY --from=build /app/dist/fp_daw/browser /usr/share/nginx/html

# Exponemos el puerto
EXPOSE 80
