# NNN — Plan técnico: Nombre de la funcionalidad

- **Spec:** [`spec.md`](./spec.md)
- **Estado:** Borrador | Aprobado

## Resumen
Enfoque elegido en 3–5 líneas.

## Chequeo de constitución
| Regla | Cumple | Nota |
|---|---|---|
| C1.2 Sin dependencias nuevas | ✅ / ❌ | |
| C2.1 Capas controller → service → repository | ✅ / ❌ | |
| C4.1 Cada servicio solo su BD | ✅ / ❌ | |

## Archivos afectados
| Módulo | Archivo | Cambio | RF |
|---|---|---|---|
| backend/core | `…/service/XServiceImpl.java` | nuevo método `…` | RF-01 |
| frontend | `app/actions/x-actions.ts` | … | RF-01 |

## Diseño
### Modelo de datos / migraciones
Entidades, columnas y migración Flyway (`V<n>__descripcion.sql`).

### Contratos (API)
`MÉTODO /ruta` — request y response DTO, códigos de error.

### Lógica (funciones puras y pseudocódigo)
```text
funcion calcular(...):
  si … entonces …
```

## Decisiones
| Decisión | Alternativa descartada | Justificación |
|---|---|---|
| | | |

## Estrategia de pruebas
| RF | Tipo | Test |
|---|---|---|
| RF-01 | Unitario (JUnit 5 + Mockito) | `XServiceImplTest.deberia…` |
| RF-02 | E2E manual (Docker + curl) | pasos |

## Riesgos
- …
