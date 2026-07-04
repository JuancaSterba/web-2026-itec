# API Gateway — Diseño (Fase 2: Desacoplamiento y Microservicios)

Fecha: 2026-07-04
Rama: `feature/api-gateway`

## Contexto

El monolito core vive en `backend/` (Maven multi-módulo: `api`, `commons`, `core`, `security`; Spring Boot 3.2.5, Java 17). El plan de Fase 2 requiere un API Gateway como puerta de entrada única (puerto 8080) que rutee tráfico hacia el backend core y, a futuro, hacia nuevos microservicios.

## Hallazgo: conflicto de puertos

El módulo `api` del core ya usaba el puerto 8080 en su profile `prod` (dev=8081, local=8082, prod=8080). Esto colisiona con el puerto reservado para el Gateway.

**Decisión (sin confirmación explícita del usuario, aplicada por timeout — reversible):** unificar `prod` a 8081, igual que `dev`, dejando el 8080 exclusivo para el Gateway en todos los ambientes. Cambio de una línea en `backend/api/src/main/resources/application-prod.yml`.

## Arquitectura

- Proyecto Maven standalone en `api-gateway/` (raíz del repo, hermano de `backend/` y `frontend/`). No se agrega como `<module>` al reactor de `backend/pom.xml` porque vive fuera de esa carpeta.
- Parent: `spring-boot-starter-parent:3.2.5` (misma versión que el core).
- Java 17.
- Dependencia: `spring-cloud-starter-gateway` (WebFlux/reactive, estándar de Spring Cloud Gateway).
- BOM: `spring-cloud-dependencies:2023.0.1` en `dependencyManagement` — release train compatible con Spring Boot 3.2.x.

## Componentes

- `pom.xml`: standalone, parent Boot 3.2.5, BOM Spring Cloud 2023.0.1, dependencia gateway.
- `ApiGatewayApplication.java`: clase `@SpringBootApplication` mínima, paquete `ar.edu.itec1misiones.gateway`.
- `application.yml`:
  - `server.port: 8080`
  - `spring.cloud.gateway.routes`: una ruta `id: core-api`, `predicates: Path=/api/core/**`, `uri: http://localhost:8081` (puerto unificado del core).

## Testing

Draft inicial de infraestructura, sin lógica de negocio propia. Validación:
- `mvn -q -pl api-gateway compile` (o build standalone) para confirmar que compila y las dependencias resuelven sin conflictos.
- Smoke manual: levantar `backend/api` y `api-gateway`, `GET http://localhost:8080/api/core/**` debe proxear al core en 8081.

No se agregan tests automatizados en este draft — es config de arranque, no lógica de negocio. Se puede añadir un test de contrato de rutas en una iteración posterior si el gateway crece.

## Fuera de alcance

- Autenticación/JWT a nivel Gateway (hoy la maneja `backend/security`).
- Circuit breakers, rate limiting, service discovery (Eureka/Consul).
- Rutas hacia microservicios que aún no existen.
