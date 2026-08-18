# 📅 Microservicio de Asistencias — Backoffice ITEC

> **Nota de Ecosistema:** Este microservicio forma parte del monorepo ITEC 2026. Para una visión general de la arquitectura completa, consulta el [README principal](../README.md).

---

## 📌 Descripción

El **MS Asistencias** es un microservicio transaccional aislado dedicado al registro y cálculo del presentismo de los alumnos en cada comisión de cursado.

### Funcionalidades Principales
- 📝 Registro diario de presentismo por comisión (Presente, Ausente, Justificado).
- ⏱️ Validación de fecha/horario de cursado consultando al Backend Core (`HorarioClient`).
- 📈 Cálculo automático de porcentaje de asistencia (umbral del 70% requerido para regularidad).
- 📊 Reportes de asistencia por alumno y por materia/comisión.

---

## 🗺️ Mapa de Relaciones en el Monorepo

| Componente | Carpeta | Relación / Comunicación |
|---|---|---|
| 🚪 **API Gateway** | [api-gateway](../api-gateway/README.md) | Enruta las peticiones de `/api/v1/asistencias/**` a este servicio (`puerto 8083`). |
| 🧠 **Backend Core** | [backend](../backend/README.md) | Este servicio consulta al Core para validar que la comisión y el horario de clase existan (`CORE_API_URL`). |
| 🖥️ **Frontend** | [frontend](../frontend/README.md) | Consume las APIs de asistencia a través del Gateway. |
| 💾 **Base de Datos** | MySQL (`localhost:3306`) | Aislamiento lógico: esquema exclusivo `db_asistencias` (sin JOINs cruzados con otras bases). |
| 📚 **Docs** | [docs](../docs/INDEX.md) | Diagramas de secuencia y reglas de negocio de regularidad. |
| 📌 **Tareas / Memoria** | [.remember](../.remember/PENDIENTES.md) | Única fuente de verdad del monorepo. |

---

## 🧱 Tecnologías

- Java 17
- Spring Boot 3.2.5 (Spring Web, Spring Data JPA, Validation)
- MySQL / H2 (testing)
- Lombok
- JJWT 0.11.5 (Validación de tokens internos)

---

## ⚙️ Variables de Entorno

| Variable | Valor Local (Dev) | Valor Docker (Prod) | Descripción |
|---|---|---|---|
| `SERVER_PORT` | `8083` | `8083` | Puerto del microservicio |
| `SPRING_PROFILES_ACTIVE` | `local` | `prod` | Perfil de configuración |
| `SPRING_DATASOURCE_URL` | `jdbc:mysql://localhost:3306/db_asistencias?createDatabaseIfNotExist=true` | `jdbc:mysql://mysql-db:3306/db_asistencias` | Conexión al esquema propio de asistencias |
| `CORE_API_URL` | `http://localhost:8082` | `http://backend-app:8082` | URL del Backend Core para validar horarios |
| `JWT_SECRET` | *(Clave simétrica)* | *(Clave simétrica)* | Secreto para validación de tokens de seguridad |

---

## 🚀 Ejecución

### Desarrollo Local (Maven)
```bash
cd ms-asistencias
mvn spring-boot:run
```

### Con Docker Compose
Desde la raíz del monorepo:
```bash
docker compose up --build ms-asistencias
```

---

## 📚 Enlaces a Documentación Relevante
- 🔄 [Diagrama de Secuencia de Asistencias](../docs/03.20-Diagrama_Secuencia_Asistencia.md)
- 📜 [Reglas de Negocio (Asistencia y Regularidad)](../docs/01.00-Reglas_de_Negocio.md)
- 📋 [Única Fuente de Verdad (Tareas)](../.remember/PENDIENTES.md)
