# 🚪 API Gateway — Backoffice ITEC

> **Nota de Ecosistema:** Este servicio es la puerta de entrada única del monorepo ITEC 2026. Para ver la arquitectura global del sistema, consulta el [README principal](../README.md).

---

## 📌 Descripción

El **API Gateway** está implementado con **Spring Cloud Gateway** (Spring Boot 3.2 / Java 17). Actúa como punto único de entrada para todas las solicitudes del cliente ([Frontend](../frontend/README.md)) y realiza:
1. **Enrutamiento centralizado** hacia el Core y los microservicios.
2. **API Gateway Token Offloading (JWT)**: Valida la firma del token JWT globalmente antes de permitir el paso de peticiones hacia servicios internos protegidos.
3. **CORS Centralizado**: Administra los orígenes permitidos para el consumo desde Next.js / Web.

---

## 🗺️ Mapa de Rutas y Redirecciones

| Prefijo de Ruta | Destino | Servicio Hermano | Puerto Docker |
|---|---|---|---|
| `/api/v1/auth/**` | Backend Core | [backend](../backend/README.md) | `8082` |
| `/api/v1/alumnos/**`, `/api/v1/profesores/**` | Backend Core | [backend](../backend/README.md) | `8082` |
| `/api/v1/carreras/**`, `/api/v1/materias/**` | Backend Core | [backend](../backend/README.md) | `8082` |
| `/api/v1/comisiones/**`, `/api/v1/inscripciones/**` | Backend Core | [backend](../backend/README.md) | `8082` |
| `/api/v1/asistencias/**` | MS Asistencias | [ms-asistencias](../ms-asistencias/README.md) | `8083` |
| `/api/v1/calificaciones/**`, `/api/v1/examenes/**` | MS Notas | [ms-notas](../ms-notas/README.md) | `8084` |

---

## 🧱 Tecnologías

- Java 17
- Spring Boot 3.2.5
- Spring Cloud Gateway (2023.0.1)
- JJWT 0.11.5 (Validación de tokens sin tocar base de datos)

---

## ⚙️ Variables de Entorno

| Variable | Valor por Defecto / Local | Descripción |
|---|---|---|
| `SERVER_PORT` | `8080` | Puerto en el que escucha el Gateway |
| `CORE_API_URL` | `http://localhost:8082` | URL del Backend Core (`http://backend-app:8082` en Docker) |
| `ASISTENCIAS_API_URL` | `http://localhost:8083` | URL de Asistencias (`http://ms-asistencias:8083` en Docker) |
| `NOTAS_API_URL` | `http://localhost:8084` | URL de Calificaciones (`http://ms-notas:8084` en Docker) |
| `JWT_SECRET` | *(Clave simétrica de 32+ caracteres)* | Debe coincidir exactamente con la clave de `backend` |

---

## 🚀 Ejecución

### Desarrollo Local (Maven)
```bash
cd api-gateway
mvn spring-boot:run
```

### Con Docker Compose (Recomendado)
Desde la raíz del proyecto:
```bash
docker compose up --build api-gateway
```

---

## 📚 Enlaces de Interés
- 📖 [Documentación Arquitectónica Central](../docs/INDEX.md)
- 🏛️ [Diagrama de Arquitectura de Contenedores](../docs/04.20-Diagrama_Arquitectura.md)
- 📋 [Única Fuente de Verdad (Tareas)](../.remember/PENDIENTES.md)
