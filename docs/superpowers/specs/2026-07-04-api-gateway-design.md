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
  - `spring.cloud.gateway.routes`: una ruta `id: core-api`, `predicates: Path=/api/core/**`, `uri: http://localhost:8081` (puerto unificado del core), `filters: RewritePath=/api/core/(?<segment>.*), /api/${segment}`.
  - El filtro `RewritePath` es necesario porque los controllers del core están mapeados en `/api/*` (ej. `/api/alumnos`), no en `/api/core/*`. Sin reescritura, el Gateway reenviaría el path literal `/api/core/alumnos` que no existe en el core.

## Testing

Draft inicial de infraestructura, sin lógica de negocio propia. Validación:
- `mvn -q -pl api-gateway compile` (o build standalone) para confirmar que compila y las dependencias resuelven sin conflictos.
- Smoke manual: levantar `backend/api` y `api-gateway`, `GET http://localhost:8080/api/core/alumnos` debe devolver el mismo status code que `GET http://localhost:8081/api/alumnos` directo (confirmado: ambos 403 sin auth, mientras que un path sin ruta definida en el Gateway da 404).

No se agregan tests automatizados en este draft — es config de arranque, no lógica de negocio. Se puede añadir un test de contrato de rutas en una iteración posterior si el gateway crece.

## Actualización: Dockerización (rama `feature/docker-gateway`)

- `api-gateway/Dockerfile`: multi-stage Maven+JRE alpine, igual patrón que `backend/Dockerfile` pero sin submódulos.
- `application.yml`: `uri` del route `core-api` pasa a `${CORE_API_URL:http://localhost:8081}` — dentro de Docker, `localhost` no resuelve al contenedor del core.
- `docker-compose.yml` (raíz): nuevo servicio `api-gateway`, puerto `8080:8080`, `CORE_API_URL=http://backend-app:8082`.

**Hallazgo: puerto real del Core en runtime Docker es 8082, no 8081.** El `.env` del backend usa `APP_PROFILE=local`, y `application-local.yml` fija `server.port: 8081` — dicho `8081` solo aplica al profile `prod` (`application-prod.yml`). Se usó 8082 para que el smoke test funcione contra el compose actual; si el compose pasa a levantar el Core en profile `prod`, hay que actualizar `CORE_API_URL` a 8081.

**Smoke test en Docker (confirmado):**
- `docker compose up --build -d` — 4 contenedores up, `mysql-db` healthy.
- `GET http://localhost:8080/api/core/alumnos` (vía Gateway) y `GET http://localhost:8082/api/alumnos` (directo al Core) devuelven ambos `403` (sin auth) — confirma que el Gateway proxea correctamente al Core a través de la red Docker interna.
- Nota: `/api/core/v3/api-docs` **no** es proxeable con la ruta actual — `RewritePath` siempre antepone `/api/`, pero Swagger vive en `/v3/api-docs` (sin prefijo `/api`) y `/auth/**` vive en `/auth` (sin prefijo `/api`). La ruta `core-api` solo cubre endpoints de negocio bajo `/api/**`. Si se necesita proxear Swagger o login a través del Gateway, hace falta una ruta adicional sin el filtro `RewritePath`.

## Fuera de alcance

- Autenticación/JWT a nivel Gateway (hoy la maneja `backend/security`).
- Circuit breakers, rate limiting, service discovery (Eureka/Consul).
- Rutas hacia microservicios que aún no existen.
