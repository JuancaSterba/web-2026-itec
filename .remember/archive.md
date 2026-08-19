# Archive

## Week of 2026-07-07
DDD refactor (9 entities+repos, Flyway MySQL, seeder E2E✓). 7+ features: actor unification, RequireRole, catalogo, comisiones (P2✓—UI/dash/calendar), correlatividades (P1 arch), inscripción, KPIs, admin. Backend: CRUD (CicloLectivo/Periodo/Comision/Inscripcion/Cursada/MateriaPlan), CondicionCursadaService, JWT/RBAC architecture, date validation. Frontend: materia dedup/inline, KPI UI, dialog/preventDefault, nav (4 groups), 8 routes, 24 orphaned files purged. Docs consolidated (16→hierarchy, AGENTS.md single-source); 3 merged (#7 RoleGuard, #9 horarios-profesor, #14 eval modalidad). 166+ commits, tsc/E2E✓.

## Week of 2026-06-29
5 major features landed: admin context+role-switcher, unificación-actores (legajo auto-gen, DNI recalc, Flyway MySQL-only), RequireRole perms, secondary phone DTOs/UI, catalogo-crud (4 tabs). 401 JWT auth bug fixed (merged to develop); 5 UX polish quick-wins (sidebar/KPI toggle, phone field optional, landing redesign, login nav). 39 commits, 3 bugs fixed; tsc/E2E passing; PENDIENTES roadmap updated; 7-task subagent plan prepared.
```