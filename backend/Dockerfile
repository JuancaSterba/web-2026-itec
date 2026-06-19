# Etapa 1: Construcción (Build)
# Usamos una imagen oficial de Maven con Java 17 para compilar el código.
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app

# Copiamos primero los archivos pom.xml (el padre y los de cada módulo).
# Esto es una estrategia para aprovechar la caché de Docker.
COPY pom.xml .
COPY api/pom.xml api/
COPY commons/pom.xml commons/
COPY core/pom.xml core/
COPY security/pom.xml security/

# Descargamos las dependencias para aprovechar la caché de Docker.
# Si el código fuente cambia pero los pom.xml no, Docker saltará este paso lento.
RUN mvn dependency:go-offline -B

# Ahora sí, copiamos el resto del código fuente del proyecto.
COPY . .

# Compilamos el proyecto entero, empaquetando todo y saltando los tests (para mayor velocidad).
RUN mvn clean package -DskipTests

# Etapa 2: Ejecución (Run)
# Usamos una imagen mucho más liviana de Java 17 (solo el JRE, sin Maven) para correr la app.
# Esto hace que la imagen final de producción pese mucho menos y sea más segura.
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Copiamos el archivo .jar compilado desde la Etapa 1 (build) hacia la Etapa 2.
# El módulo 'api' es el que contiene el entrypoint de Spring Boot.
COPY --from=build /app/api/target/*.jar app.jar

# Definimos un argumento para el puerto (por defecto 8080 para prod)
ARG APP_PORT=8080
# Exponemos el puerto dinámicamente según el entorno
EXPOSE ${APP_PORT}

# Comando que se ejecuta al iniciar el contenedor. Levanta la aplicación Spring Boot.
ENTRYPOINT ["java", "-jar", "app.jar"]
