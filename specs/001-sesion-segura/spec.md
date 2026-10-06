# 001 — Sesión segura y perfil desde el servidor

- **Estado:** Borrador
- **Fecha:** 2026-10-06
- **Rama:** `feature/001-sesion-segura`

## Contexto
Resuelve la deuda #36. Hoy el inicio de sesión se hace desde la página del navegador, y la credencial de sesión, los datos personales (nombre, DNI, email, teléfono), los roles y el rol activo quedan guardados en un almacenamiento del navegador que cualquier código de la página puede leer. Si se ejecuta código malicioso en la página, puede robar la sesión y los datos personales. Además, el perfil muestra los datos que había al iniciar sesión, aunque un administrador los haya corregido después.

Esto viola las reglas C2.4 y C4.5 de la constitución, que hoy lo toleran como excepción heredada. Esta spec elimina esa excepción.

Actores: usuarios con acceso al backoffice (admin, administrativo, profesor), con uno o varios roles.

## Historias de usuario
- **HU-01** — Como usuario, quiero iniciar sesión sin que mi credencial ni mis datos personales queden expuestos en el navegador, para que nadie pueda robar mi sesión.
- **HU-02** — Como usuario con varios roles, quiero elegir mi rol activo y que se mantenga al recargar o abrir otra pestaña, para no tener que elegirlo de nuevo.
- **HU-03** — Como usuario, quiero ver en mi perfil mis datos vigentes, para comprobar que están correctos.
- **HU-04** — Como usuario, quiero cerrar sesión, para que nadie siga usando mi cuenta en ese navegador.
- **HU-05** — Como usuario, quiero que se me avise cuando mi sesión venció, para entender por qué tengo que volver a entrar.

## Requisitos funcionales
| Id | Requisito (EARS) | HU |
|---|---|---|
| RF-01 | CUANDO un usuario inicia sesión con credenciales válidas, EL SISTEMA DEBE abrir su sesión sin que la credencial de sesión sea accesible para el código que se ejecuta en la página. | HU-01 |
| RF-02 | EL SISTEMA DEBE abstenerse de guardar la credencial de sesión, los datos personales, los roles o el rol activo en almacenamiento del navegador accesible para la página. | HU-01 |
| RF-03 | SI el usuario ingresa un usuario inexistente o una contraseña incorrecta, ENTONCES EL SISTEMA DEBE rechazar el acceso mostrando el mismo mensaje "Credenciales inválidas" en ambos casos. | HU-01 |
| RF-04 | SI el usuario está inactivo, ENTONCES EL SISTEMA DEBE rechazar el acceso mostrando "Usuario inactivo o sin permisos". | HU-01 |
| RF-05 | SI el usuario o la contraseña están vacíos, ENTONCES EL SISTEMA DEBE impedir el envío e indicar el campo obligatorio. | HU-01 |
| RF-06 | CUANDO un usuario con un único rol inicia sesión, EL SISTEMA DEBE llevarlo al panel principal con ese rol activo. | HU-01 |
| RF-07 | CUANDO un usuario con más de un rol inicia sesión, EL SISTEMA DEBE pedirle que elija el rol activo antes de entrar al panel principal. | HU-02 |
| RF-08 | CUANDO el usuario elige o cambia su rol activo, EL SISTEMA DEBE recordarlo del lado del servidor, de modo que se mantenga al recargar la página o abrir otra pestaña. | HU-02 |
| RF-09 | SI el usuario intenta activar un rol que no tiene asignado, ENTONCES EL SISTEMA DEBE rechazarlo y mantener el rol activo anterior. | HU-02 |
| RF-10 | MIENTRAS el usuario tenga un rol activo, EL SISTEMA DEBE mostrar los menús y vistas de ese rol. | HU-02 |
| RF-11 | CUANDO el usuario abre su perfil, EL SISTEMA DEBE mostrar su nombre, apellido, DNI, email y teléfono vigentes en ese momento. | HU-03 |
| RF-12 | CUANDO el usuario abre su perfil, EL SISTEMA DEBE mostrar todos sus roles e indicar cuál es el activo. | HU-03 |
| RF-13 | EL SISTEMA DEBE mostrar en el perfil únicamente los datos del usuario que tiene la sesión abierta. | HU-03 |
| RF-14 | SI los datos del perfil no se pueden obtener, ENTONCES EL SISTEMA DEBE mostrar un mensaje de error sin cerrar la sesión. | HU-03 |
| RF-15 | CUANDO el usuario cierra sesión, EL SISTEMA DEBE eliminar la sesión de ese navegador y llevarlo al inicio de sesión. | HU-04 |
| RF-16 | MIENTRAS no haya sesión abierta, EL SISTEMA DEBE redirigir al inicio de sesión cualquier intento de entrar a una pantalla interna. | HU-04 |
| RF-17 | SI la sesión vence o deja de ser válida mientras el usuario navega, ENTONCES EL SISTEMA DEBE llevarlo al inicio de sesión con el aviso "Tu sesión expiró, volvé a iniciar sesión". | HU-05 |
| RF-18 | CUANDO un usuario con sesión abierta entra a la pantalla de inicio de sesión, EL SISTEMA DEBE llevarlo al panel principal. | HU-01 |
| RF-19 | CUANDO un navegador con datos guardados por la versión anterior del sistema abre la aplicación, EL SISTEMA DEBE borrar esos datos. | HU-01 |

## Casos límite
- Usuario inexistente o contraseña incorrecta: mismo mensaje, sin revelar si el usuario existe → RF-03.
- Usuario inactivo con contraseña correcta → RF-04.
- Campos vacíos → RF-05.
- Usuario multi-rol que recarga la página o abre otra pestaña después de elegir rol → RF-08.
- Intento de activar un rol no asignado (por ejemplo, manipulando la petición) → RF-09.
- Un administrador corrige el email del usuario mientras este tiene la sesión abierta → RF-11.
- Falla al consultar los datos del perfil → RF-14.
- Sesión vencida (24 h) o credencial alterada a mitad de la navegación → RF-17.
- Entrar con la URL de una pantalla interna sin sesión → RF-16.
- Navegador con datos guardados por la versión anterior (sesiones abiertas antes del cambio) → RF-19.

## Fuera de alcance
- Revocar la sesión en el servidor al cerrar sesión: la credencial sigue siendo válida hasta vencer. Se registra como pendiente nuevo.
- Restringir permisos según el rol activo: los permisos siguen siendo los de todos los roles del usuario; el rol activo solo cambia menús y vistas.
- Cambiar la duración de la sesión (24 h).
- Portal propio para el rol alumno.
- Editar los datos personales desde el perfil.

## Preguntas abiertas
- Ninguna. Resueltas en la entrevista del 2026-10-06: el rol activo lo recuerda el servidor y solo afecta menús y vistas; el perfil muestra datos vigentes; al vencer la sesión se avisa en el login; revocar la sesión en el servidor queda fuera de alcance.
