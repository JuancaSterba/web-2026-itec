# 🎓 Backoffice Académico ITEC - Repositorio Principal

Este es un repositorio unificado (monorepo) que contiene todos los componentes del sistema de gestión académica para el ITEC N°1.

## 📂 Estructura del Repositorio

El proyecto está dividido en varios submódulos o carpetas principales, cada uno con su propio conjunto de responsabilidades y su respectiva documentación:

* **[`/backend`](./backend)**: Contiene el código fuente del backend, desarrollado en Java 17 con Spring Boot bajo una arquitectura de microservicios y contenedorizado con Docker.
* **[`/frontend`](./frontend)**: Contiene el código fuente del frontend, desarrollado con Next.js 14, React 18, y Tailwind CSS.
* **[`/docs`](./docs)**: Contiene toda la documentación arquitectónica, técnica y de negocio generada para el sistema (diagramas, modelos de datos, etc.).

## 🚀 Cómo empezar

Dado que es un repositorio modular, puedes optar por levantar ambos entornos al mismo tiempo usando herramientas como Docker (recomendado para ver el flujo completo) o ejecutar cada proyecto de forma individual para desarrollo.

### Ejecución de Backend
Revisa el [`README.md` del backend](./backend/README.md) para instrucciones detalladas sobre cómo levantar la base de datos y los microservicios usando Docker Compose o localmente con Maven.

### Ejecución de Frontend
Revisa el [`README.md` del frontend](./frontend/README.md) para instrucciones sobre cómo instalar las dependencias con npm y levantar el servidor de desarrollo de Next.js.
