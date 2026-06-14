# 🎓 Backoffice Académico ITEC - Backend

> **Nota importante:** Este proyecto forma parte de un **repositorio modular (monorepo)**. El código y documentación que ves aquí corresponden exclusivamente al **Backend**. Para ver el frontend o la vista general del proyecto, por favor dirígete a la [raíz del repositorio](../README.md).

## 📌 Descripción
spring.profiles.active=dev

Este proyecto corresponde al trabajo final de la carrera de Desarrollo de Software del ITEC N°1.  
El objetivo es desarrollar un sistema de **gestión académica centralizada** para docentes y administrativos, que facilite la administración de alumnos, materias, asistencias, calificaciones y validaciones académicas, garantizando escalabilidad mediante una arquitectura moderna.

---

## 🧩 Funcionalidades principales

- Login seguro con roles diferenciados: Docente, Administrativo, Alumno, Administrador.
- Gestión de alumnos, profesores y materias.
- Registro de asistencias.
- Control de regularidad (Cálculo automático del 70% de asistencia obligatoria).
- Gestión de calificaciones (exámenes, parciales y finales).
- Validación automática de materias correlativas al inscribirse.
- Generación de reportes académicos.

---

## 🧱 Arquitectura y tecnologías

- 🧠 **Backend:** Java 17 + Spring Boot
- 🐳 **Despliegue y Orquestación:** Docker + Docker Compose (Arquitectura basada en Microservicios)
- 💾 **Base de datos:** Relacional (MySQL/PostgreSQL)
- 🔐 **Seguridad:** JWT con Spring Security
- ☁️ **Patrón:** Modelo-Vista-Controlador (MVC) y diseño en multicapas.
- 🗃️ **Versionado:** Git + GitHub + Git Flow

---

## 🗂️ Estructura del proyecto (Modular Maven / Docker)

El proyecto adopta un patrón de microservicios para aislar lógicas críticas. La estructura de Maven se alinea con los contenedores Docker definidos:

```bash
/backend
├── pom.xml (POM padre)
├── /commons                      # Librería compartida (DTOs, Enums, Utils). Sin contenedor.
├── /security                     # Librería compartida (Configuración JWT, Filtros). Sin contenedor.
├── /core                         # App Principal (Contenedor 3) - CRUD general e inscripciones.
├── /microservicio-asistencias    # Servicio dedicado a Asistencias (Contenedor 4).
└── /microservicio-calificaciones # Servicio dedicado a Notas y Evaluaciones (Contenedor 5).
```

---

## 🧾 Documentación y Diagramas

Toda la documentación arquitectónica, técnica y de negocio generada se encuentra en la carpeta raíz `/docs`. Puedes consultar los siguientes diagramas (en formato Mermaid) para comprender a fondo el sistema:

1. 🏛️ **[Diagrama de Arquitectura](../docs/Diagrama_Arquitectura.md)**: Contenedores y orquestación.
2. 📦 **[Diagrama de Clases](../docs/Diagrama_Clases.md)**: Diseño Orientado a Objetos (Modelos).
3. 🔄 **[Diagrama de Secuencia (Inscripciones)](../docs/Diagrama_Secuencia_Inscripciones.md)**: Flujos de negocio para anotar alumnos a carreras y materias.
4. 🔄 **[Diagrama de Secuencia (Asistencias)](../docs/Diagrama_Secuencia_Asistencia.md)**: Flujo de validación automática de inasistencias y pérdida de regularidad.
5. 🚥 **[Diagrama de Estados](../docs/Diagrama_Estados.md)**: Transición del estado académico del alumno (Inscripto, Regular, Libre, etc.).
6. 🗄️ **[Modelo de Datos (DER)](../docs/Modelo_Datos.md)**: Estructura relacional de las tablas.
7. 🔍 **[Análisis del Modelo](../docs/Analisis_Modelo.md)**: Recomendaciones técnicas y puntos de negocio clave a revisar en el desarrollo.

---

## 🧪 Cómo ejecutar

1. Cloná el repositorio:
```bash
git clone https://github.com/usuario/backoffice-itec.git
cd backoffice-itec
```

2. Levantá la infraestructura con Docker Compose (desde la raíz del proyecto):
```bash
docker-compose up --build
```
*(Alternativamente, para desarrollar en local sin Docker, ejecuta `mvn clean install` y luego corre `mvn spring-boot:run` en el directorio de cada aplicación ejecutable).*

---

## 🧬 Git Flow y buenas prácticas

- Todas las funcionalidades nuevas se desarrollan en ramas `feature/*`
- Ramas base:
    - `main` / `master`: Versión estable, refleja lo que está en producción.
    - `develop`: Integración en progreso.
- Ejemplo de nombre de commit:
  ```
  feat: US-ALU-01 Agrega endpoint para alta de alumnos
  ```

---

## 📋 Evaluación

Cada integrante será evaluado individualmente. El sistema será presentado en la mesa de examen, junto con este repositorio y su documentación. Se deberá poder explicar y defender las decisiones técnicas y de arquitectura adoptadas (MVC, POO, Persistencia, Docker).

---

> 💬 Para dudas, contactarse con el docente asignado.
