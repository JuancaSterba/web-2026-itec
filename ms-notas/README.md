# 📊 Microservicio de Calificaciones (MS Notas) — Backoffice ITEC

> **Nota de Ecosistema:** Este microservicio forma parte del monorepo ITEC 2026. Para una visión general de la arquitectura completa, consulta el [README principal](../README.md).

---

## 📌 Descripción

El **MS Notas** es un microservicio transaccional aislado responsable de la gestión de instancias de evaluación académica (parciales, recuperatorios, trabajos prácticos y finales) y el cálculo de la condición académica final del alumno.

### Funcionalidades Principales
- 📝 Registro y edición de calificaciones por comisión o mesa de examen.
- 🎯 Manejo de múltiples instancias evaluativas (Parcial 1, Parcial 2, Recuperatorio, Final).
- ⚖️ Cálculo automático de condición académica (Promocionado, Regular, Libre).
- 🔒 Cierre y bloqueo de actas evaluativas.

---

## 🗺️ Mapa de Relaciones en el Monorepo

| Componente | Carpeta | Relación / Comunicación |
|---|---|---|
| 🚪 **API Gateway** | [api-gateway](../api-gateway/README.md) | Enruta las peticiones de `/api/v1/calificaciones/**` y `/api/v1/examenes/**` a este servicio (`puerto 8084`). |
| 🧠 **Backend Core** | [backend](../backend/README.md) | El Core consulta a este microservicio (`NotasClient`) para obtener las notas y determinar regularidades. |
| 🖥️ **Frontend** | [frontend](../frontend/README.md) | Consume las vistas de carga de notas y actas a través del Gateway. |
| 💾 **Base de Datos** | MySQL (`localhost:3306`) | Aislamiento lógico: esquema exclusivo `db_calificaciones` (sin JOINs directos con otras bases). |
| 📚 **Docs** | [docs](../docs/INDEX.md) | Diagramas de secuencia de notas, matriz de correlativas y reglas de evaluación. |
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
| `SERVER_PORT` | `8084` | `8084` | Puerto del microservicio |
| `SPRING_PROFILES_ACTIVE` | `local` | `prod` | Perfil de configuración |
| `SPRING_DATASOURCE_URL` | `jdbc:mysql://localhost:3306/db_calificaciones?createDatabaseIfNotExist=true` | `jdbc:mysql://mysql-db:3306/db_calificaciones` | Conexión al esquema de calificaciones |
| `CORE_API_URL` | `http://localhost:8082` | `http://backend-app:8082` | URL del Backend Core para validar comisiones |
| `JWT_SECRET` | *(Clave simétrica)* | *(Clave simétrica)* | Secreto para validación de tokens de seguridad |

---

## 🚀 Ejecución

### Desarrollo Local (Maven)
```bash
cd ms-notas
mvn spring-boot:run
```

### Con Docker Compose
Desde la raíz del monorepo:
```bash
docker compose up --build ms-notas
```

---

## 📚 Enlaces a Documentación Relevante
- 🔄 [Diagrama de Secuencia de Calificaciones](../docs/03.30-Diagrama_Secuencia_Notas.md)
- 🚥 [Diagrama de Estados Académicos](../docs/02.20-Diagrama_Estados.md)
- 📜 [Reglas de Negocio (Evaluaciones y Escala de Notas)](../docs/01.00-Reglas_de_Negocio.md)
- 📋 [Única Fuente de Verdad (Tareas)](../.remember/PENDIENTES.md)
