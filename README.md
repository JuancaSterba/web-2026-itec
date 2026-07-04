# 🎓 Backoffice Académico ITEC - Sistema de Gestión 2026

Este repositorio contiene la solución completa de software para la gestión académica del Instituto Tecnológico N°1 (ITEC). El proyecto ha sido diseñado pensando en la escalabilidad, separación de responsabilidades y despliegue rápido, implementando una **Arquitectura de Microservicios Orquestada con Docker** y un cliente web moderno.

## 🏛️ Ecosistema y Arquitectura

El sistema ha sido desacoplado para asegurar que cada módulo maneje su propio contexto (aislamiento lógico de base de datos) interactuando únicamente a través de la red:

1. **API Gateway (`/api-gateway`)**: Enrutador centralizado (Puerto 8080). Toda petición del cliente pasa por aquí. Se encarga además del **API Gateway Token Offloading**, validando el JWT globalmente y protegiendo a los microservicios subyacentes.
2. **Backend Core (`/backend`)**: El monolito principal. Gestiona la identidad (Spring Security), los ABMs de las estructuras académicas maestras (Carreras, Materias, Alumnos, Profesores) y las matriculaciones. 
3. **MS Asistencias (`/ms-asistencias`)**: Microservicio transaccional aislado, dedicado puramente al registro de presentismo diario de alumnos por comisión.
4. **MS Calificaciones (`/ms-notas`)**: Microservicio transaccional aislado para la gestión de instancias evaluativas (exámenes) y calificaciones.
5. **Frontend (`/frontend`)**: Aplicación web SPA/SSR desarrollada en Next.js 14 y React 18 que consumirá los datos provistos por el Gateway.

> 📚 **Ver Documentación Completa**: Consulta los diagramas técnicos (C4, Diagramas de Secuencia) en [`docs/arquitectura/diagrama_ecosistema.md`](./docs/arquitectura/diagrama_ecosistema.md) para comprender cómo fluye el tráfico y la seguridad a través de los contenedores.

## 📂 Estructura del Repositorio

* **[`/api-gateway`](./api-gateway)**: Proyecto Spring Cloud Gateway.
* **[`/backend`](./backend)**: Proyecto Spring Boot (Gestión Maestra).
* **[`/ms-asistencias`](./ms-asistencias)**: Proyecto Spring Boot (Microservicio).
* **[`/ms-notas`](./ms-notas)**: Proyecto Spring Boot (Microservicio).
* **[`/frontend`](./frontend)**: Aplicación cliente Next.js.
* **[`/docs`](./docs)**: Toda la documentación arquitectónica, registros de decisiones (ADRs) y specs.
* **`docker-compose.yml`**: Orquestador central para levantar todo el ecosistema con un solo comando.

## 🚀 Cómo Empezar (Modo Orquestado)

El entorno de desarrollo y producción se basa fuertemente en Docker. Para levantar toda la infraestructura base de datos, backend core, gateway y microservicios, simplemente ejecuta desde la raíz:

```bash
docker compose up --build -d
```

### Puertos Expuestos (En Local)
Si necesitas probar servicios individuales fuera del Gateway:
- **API Gateway (Punto de entrada recomendado):** `http://localhost:8080`
- **Backend Core:** `http://localhost:8082` (En dev local sin docker), o `8081` en perfil prod/docker.
- **MS Asistencias:** `http://localhost:8083`
- **MS Calificaciones:** `http://localhost:8084`
- **Base de Datos MySQL:** `localhost:3306` (Contiene `backoffice_itec`, `db_asistencias`, `db_calificaciones`)
- **Frontend Next.js:** `http://localhost:3000`

---
*Desarrollado con ♥ para el ITEC N°1 Misiones.*
