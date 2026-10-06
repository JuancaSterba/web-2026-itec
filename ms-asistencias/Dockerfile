# Etapa 1: build e instalacion de backend/commons en el repo Maven local.
# ApiResponse/ErrorDto/Meta ahora se comparten con el Core (deuda_tecnica.md
# #2) -- ms-asistencias es un proyecto Maven standalone fuera del reactor de
# backend/, asi que necesita el jar de commons instalado en ~/.m2 antes de
# poder resolverlo como dependencia normal. Requiere que el build context de
# este servicio sea la raiz del repo (ver docker-compose.yml).
FROM maven:3.9.6-eclipse-temurin-17 AS commons-build
WORKDIR /workspace
COPY backend/pom.xml backend/pom.xml
COPY backend/commons backend/commons
# -N (non-recursive): solo instala el POM padre, sin bajar/compilar
# api/core/security, que no hacen falta para este microservicio.
RUN mvn -f backend/pom.xml -N install -q
RUN mvn -f backend/commons/pom.xml install -DskipTests -q

# Etapa 2: Construccion del microservicio
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app

# Reusamos el repo Maven local ya poblado con commons de la etapa anterior.
COPY --from=commons-build /root/.m2 /root/.m2

# Copiamos primero el pom.xml para aprovechar la cache de Docker.
COPY ms-asistencias/pom.xml .
RUN mvn dependency:go-offline -B

# Copiamos el resto del codigo fuente.
COPY ms-asistencias/src src

# Compilamos el proyecto, saltando los tests para mayor velocidad.
RUN mvn clean package -DskipTests

# Etapa 3: Ejecucion (Run)
# Usamos una imagen liviana de Java 17 (solo el JRE) para correr la app.
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Copiamos el jar compilado desde la etapa de build.
COPY --from=build /app/target/*.jar app.jar

EXPOSE 8083

ENTRYPOINT ["java", "-jar", "app.jar"]
