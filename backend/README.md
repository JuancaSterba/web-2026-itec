# 🎓 Backoffice Académico ITEC — Backend Core

> **Nota de Ecosistema:** Este módulo es el núcleo maestro del monorepo ITEC 2026. Para una visión general de la arquitectura completa, consulta el [README principal](../README.md).

---

## 📌 Descripción

El **Backend Core** es el servicio central de gestión académica y autenticación. Administra las entidades maestras institucionales, las matrículas e inscripciones, y actúa como proveedor de identidad emitiendo tokens JWT.

### Funcionalidades Principales
- 🔐 **Autenticación y Autorización:** Emisión y validación de tokens JWT (Roles: `ADMIN`, `DIRECTIVO`, `PRECEPTOR`, `DOCENTE`, `ESTUDIANTE`).
- 👥 **Gestión de Personas:** Alumnos, Profesores, Administrativos, Directivos.
- 🏛️ **Catálogo Académico:** Sedes, Carreras, Planes de Estudio, Materias, Aulas y Horarios.
- 📋 **Inscripciones y Comisiones:** Ciclos lectivos, apertura de comisiones, inscripciones de alumnos y control de correlatividades.
- 📑 **Mesas de Examen:** Gestión de actas de examen final y turnos de examen.

---

## 🗺️ Mapa de Relaciones en el Monorepo

| Componente | Carpeta | Relación / Comunicación |
|---|---|---|
| 🚪 **API Gateway** | [api-gateway](../api-gateway/README.md) | Enruta el tráfico externo hacia los endpoints de este Core (`/api/v1/auth/**`, `/api/v1/alumnos/**`, etc.). |
| 🖥️ **Frontend** | [frontend](../frontend/README.md) | Consume las APIs a través del Gateway (puerto 8080). |
| 📅 **MS Asistencias** | [ms-asistencias](../ms-asistencias/README.md) | Consulta a Core (`HorarioClient`) para validar horarios y comisiones vigentes. |
| 📊 **MS Notas** | [ms-notas](../ms-notas/README.md) | Core consulta a Notas (`NotasClient`) para cálculos de condición final de alumnos. |
| 📚 **Docs** | [docs](../docs/INDEX.md) | Diagramas de Clases, DER, Secuencia y Reglas de Negocio centralizadas. |
| 📌 **Tareas / Memoria** | [.remember](../.remember/PENDIENTES.md) | Única fuente de verdad de backlog y deudas técnicas. |

---

## 🧱 Estructura del Módulo

```
/backend
├── pom.xml                   # POM padre multi-módulo
├── commons/                  # DTOs comunes, Enums, ApiResponse, excepciones globales
├── security/                 # Librería compartida de configuración JWT y filtros
└── core/                     # Aplicación Spring Boot ejecutable (Entidades, Repositorios, Servicios, Controllers)
```

---

## ⚙️ Variables de Entorno Clave

| Variable | Valor Local (Dev) | Valor Docker (Prod) | Descripción |
|---|---|---|---|
| `APP_PORT` | `8082` | `8082` (o `8081`) | Puerto del servidor Spring Boot |
| `SPRING_PROFILES_ACTIVE` | `local` | `prod` | Perfil de configuración activo |
| `DB_URL` | `jdbc:mysql://localhost:3306/backoffice_itec` | `jdbc:mysql://mysql-db:3306/backoffice_itec` | Conexión a la base de datos principal |
| `JWT_SECRET` | *(Clave simétrica)* | *(Clave simétrica)* | Secreto para firma de JWT (compartido con Gateway) |
| `NOTAS_API_URL` | `http://localhost:8084` | `http://ms-notas:8084` | Endpoint del microservicio de notas |

---

## 🚀 Ejecución

### Desarrollo Local (Maven)
```bash
cd backend
mvn clean install
cd core
mvn spring-boot:run
```

### Con Docker Compose
Desde la raíz del monorepo:
```bash
docker compose up --build backend-app
```

---

## 📚 Enlaces a Documentación Relevante
- 🗄️ [Modelo de Datos (DER)](../docs/02.00-Modelo_Datos.md)
- 📦 [Diagrama de Clases](../docs/02.10-Diagrama_Clases.md)
- 🔄 [Diagrama de Secuencia de Inscripciones](../docs/03.10-Diagrama_Secuencia_Inscripciones.md)
- 📜 [Reglas de Negocio](../docs/01.00-Reglas_de_Negocio.md)
