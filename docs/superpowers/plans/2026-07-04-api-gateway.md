# API Gateway Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Inicializar un proyecto Spring Cloud Gateway standalone en `api-gateway/` (raíz del repo) que levante en el puerto 8080 y rutee `/api/core/**` hacia el backend core.

**Architecture:** Proyecto Maven standalone (no forma parte del reactor de `backend/pom.xml`), Spring Boot 3.2.5 + Spring Cloud Gateway (`spring-cloud-dependencies:2023.0.1`), Java 17. Ruta declarativa única en `application.yml` hacia `http://localhost:8081` (puerto unificado del core tras corregir el conflicto de puertos).

**Tech Stack:** Java 17, Maven, Spring Boot 3.2.5, Spring Cloud Gateway 2023.0.1 (WebFlux/reactive).

## Global Constraints

- Java 17 (idéntico al backend core).
- Spring Boot `3.2.5` (idéntico al backend core, ver `backend/pom.xml:8`).
- Spring Cloud BOM `2023.0.1` (release train compatible con Boot 3.2.x).
- Puerto del Gateway: `8080`.
- Puerto del core tras unificación: `8081` (todos los profiles).
- No agregar autenticación, circuit breakers, service discovery, ni rutas a microservicios inexistentes (fuera de alcance según spec).

---

### Task 1: Unificar puerto del core a 8081 en profile prod

**Files:**
- Modify: `backend/api/src/main/resources/application-prod.yml:17-18`

**Interfaces:**
- Produces: core corriendo en puerto 8081 en los tres profiles (dev/local/prod), consumido por la ruta del Gateway en Task 3.

- [ ] **Step 1: Cambiar el puerto**

En `backend/api/src/main/resources/application-prod.yml`, reemplazar:

```yaml
server:
  port: 8080
```

por:

```yaml
server:
  port: 8081
```

- [ ] **Step 2: Verificar que no queda otra referencia a 8080 en backend/**

Run: `grep -rn "8080" backend/api/src/main/resources/`
Expected: sin resultados (ninguna referencia a 8080 en los application-*.yml del módulo api).

- [ ] **Step 3: Commit**

```bash
git add backend/api/src/main/resources/application-prod.yml
git commit -m "fix(config): unificar puerto del core a 8081 en prod para liberar 8080 al api-gateway"
```

---

### Task 2: Scaffolding del proyecto Maven `api-gateway`

**Files:**
- Create: `api-gateway/pom.xml`
- Create: `api-gateway/src/main/java/ar/edu/itec1misiones/gateway/ApiGatewayApplication.java`
- Create: `api-gateway/.gitignore`

**Interfaces:**
- Produces: proyecto Maven compilable con `spring-cloud-starter-gateway` en el classpath; clase `ApiGatewayApplication` como entry point, consumida por Task 3 (que solo agrega el `application.yml`, no toca la clase Java).

- [ ] **Step 1: Crear `api-gateway/pom.xml`**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.2.5</version>
        <relativePath/>
    </parent>

    <groupId>ar.edu.itec1misiones</groupId>
    <artifactId>api-gateway</artifactId>
    <version>1.0.0</version>
    <name>api-gateway</name>
    <description>API Gateway - puerta de entrada unica hacia el backend core y microservicios</description>

    <properties>
        <java.version>17</java.version>
        <spring-cloud.version>2023.0.1</spring-cloud.version>
    </properties>

    <dependencies>
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-starter-gateway</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>

    <dependencyManagement>
        <dependencies>
            <dependency>
                <groupId>org.springframework.cloud</groupId>
                <artifactId>spring-cloud-dependencies</artifactId>
                <version>${spring-cloud.version}</version>
                <type>pom</type>
                <scope>import</scope>
            </dependency>
        </dependencies>
    </dependencyManagement>

    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
                <configuration>
                    <mainClass>ar.edu.itec1misiones.gateway.ApiGatewayApplication</mainClass>
                </configuration>
            </plugin>
        </plugins>
    </build>
</project>
```

- [ ] **Step 2: Crear la clase principal**

`api-gateway/src/main/java/ar/edu/itec1misiones/gateway/ApiGatewayApplication.java`:

```java
package ar.edu.itec1misiones.gateway;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class ApiGatewayApplication {

    public static void main(String[] args) {
        SpringApplication.run(ApiGatewayApplication.class, args);
    }
}
```

- [ ] **Step 3: Crear `.gitignore` (idéntico al de `backend/`, target/ de Maven)**

```
target/
*.class
.mvn/
!.mvn/wrapper/maven-wrapper.jar
.idea/
*.iml
```

- [ ] **Step 4: Compilar para validar el pom y las dependencias**

Run: `cd api-gateway && mvn -q compile`
Expected: `BUILD SUCCESS`, sin errores de resolución de dependencias.

- [ ] **Step 5: Commit**

```bash
git add api-gateway/pom.xml api-gateway/src/main/java/ar/edu/itec1misiones/gateway/ApiGatewayApplication.java api-gateway/.gitignore
git commit -m "feat(api-gateway): inicializar proyecto Spring Cloud Gateway standalone"
```

---

### Task 3: Configuración de arranque y ruta hacia el core

**Files:**
- Create: `api-gateway/src/main/resources/application.yml`

**Interfaces:**
- Consumes: `ApiGatewayApplication` de Task 2 (arranca con esta config por convención de Spring Boot).
- Produces: Gateway escuchando en 8080, ruta `core-api` proxeando `/api/core/**` hacia `http://localhost:8081`.

- [ ] **Step 1: Crear `api-gateway/src/main/resources/application.yml`**

```yaml
server:
  port: 8080

spring:
  application:
    name: api-gateway
  cloud:
    gateway:
      routes:
        - id: core-api
          uri: http://localhost:8081
          predicates:
            - Path=/api/core/**

logging:
  level:
    root: info
    org.springframework.cloud.gateway: debug
```

- [ ] **Step 2: Compilar y validar arranque**

Run: `cd api-gateway && mvn -q spring-boot:run` (dejarlo correr unos segundos y detener con Ctrl+C)
Expected: log `Netty started on port 8080` (o equivalente), sin excepciones de arranque.

- [ ] **Step 3: Smoke test de la ruta (requiere el core corriendo en 8081 en paralelo)**

Run (en otra terminal, con `backend/api` corriendo vía `mvn spring-boot:run` con profile dev): `curl -i http://localhost:8080/api/core/actuator/health` o cualquier endpoint real de `/api/core/**` que exponga el core.
Expected: respuesta proxeada desde el core (no un 404 del propio Gateway), confirmando que la ruta reenvía correctamente a 8081.

- [ ] **Step 4: Commit**

```bash
git add api-gateway/src/main/resources/application.yml
git commit -m "feat(api-gateway): configurar puerto 8080 y ruta /api/core/** hacia el backend core"
```

---

## Fuera de alcance (según spec)

- Autenticación/JWT a nivel Gateway.
- Circuit breakers, rate limiting, service discovery.
- Rutas hacia microservicios que aún no existen.
