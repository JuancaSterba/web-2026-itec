# Etapa 1: Construcción (Build)
# Usamos una imagen oficial de Maven con Java 17 para compilar el código.
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app

# Copiamos primero el pom.xml para aprovechar la caché de Docker.
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copiamos el resto del código fuente.
COPY src src

# Compilamos el proyecto, saltando los tests para mayor velocidad.
RUN mvn clean package -DskipTests

# Etapa 2: Ejecución (Run)
# Usamos una imagen liviana de Java 17 (solo el JRE) para correr la app.
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Copiamos el jar compilado desde la etapa de build.
COPY --from=build /app/target/*.jar app.jar

EXPOSE 8083

ENTRYPOINT ["java", "-jar", "app.jar"]
