# Gestión Académica Frontend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir las interfaces de usuario para la Gestión Académica (Catálogo, Cursadas y Panel de Comisión) siguiendo una estructura jerárquica.

**Architecture:** Frontend en Next.js (App Router). Uso de componentes de UI (shadcn/ui), tablas, pestañas (Tabs) y modales (Dialogs). La lógica de permisos usa `RequireRole`.

**Tech Stack:** Next.js, React, TailwindCSS, TypeScript.

## Global Constraints

- Utilizar el componente `<RequireRole>` para restringir Catálogo y Gestión a `ADMIN` o `ADMINISTRATIVO`.
- Las pantallas de Profesores solo acceden vía "Mis Comisiones".
- Evitar mutar el legajo. Todo se enlaza con el ID.

---

### Task 1: Sidebar Navigation
**Files:**
- Modify: `frontend/components/layout/sidebar.tsx:10-20` (líneas relativas al array de navegación)

**Interfaces:**
- Consumes: `RequireRole` logic for hiding links.
- Produces: Updated navigation links.

- [ ] **Step 1: Modify Sidebar links**
```tsx
// En frontend/components/layout/sidebar.tsx, busca el array de enlaces (links/routes) y añade:
{ name: "Carreras y Materias", href: "/dashboard/catalogo", icon: "BookOpen", roles: ["ADMIN", "ADMINISTRATIVO"] },
{ name: "Gestión de Cursadas", href: "/dashboard/cursadas", icon: "Calendar", roles: ["ADMIN", "ADMINISTRATIVO"] },
{ name: "Mis Comisiones", href: "/dashboard/mis-comisiones", icon: "Users", roles: ["PROFESOR"] },
```

- [ ] **Step 2: Commit**
```bash
git add frontend/components/layout/sidebar.tsx
git commit -m "feat(frontend): add navigation links for gestion academica"
```

---

### Task 2: Pantalla Catálogo (Carreras y Materias)
**Files:**
- Create: `frontend/app/dashboard/catalogo/page.tsx`
- Create: `frontend/components/academico/catalogo-view.tsx`

**Interfaces:**
- Produces: UI para listar Carreras.

- [ ] **Step 1: Create Page**
```tsx
// frontend/app/dashboard/catalogo/page.tsx
import { RequireRole } from "@/components/auth/require-role";
import { CatalogoView } from "@/components/academico/catalogo-view";

export default function CatalogoPage() {
  return (
    <RequireRole allowedRoles={["ADMIN", "ADMINISTRATIVO"]}>
      <CatalogoView />
    </RequireRole>
  );
}
```

- [ ] **Step 2: Create View component**
```tsx
// frontend/components/academico/catalogo-view.tsx
export function CatalogoView() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Catálogo Académico</h1>
      <p>Gestión de Carreras y Materias.</p>
    </div>
  );
}
```

- [ ] **Step 3: Commit**
```bash
git add frontend/app/dashboard/catalogo/page.tsx frontend/components/academico/catalogo-view.tsx
git commit -m "feat(frontend): skeleton for catalogo academico"
```

---

### Task 3: Pantalla Gestión de Cursadas (Comisiones)
**Files:**
- Create: `frontend/app/dashboard/cursadas/page.tsx`
- Create: `frontend/components/academico/cursadas-view.tsx`

- [ ] **Step 1: Create Page and View**
```tsx
// frontend/app/dashboard/cursadas/page.tsx
import { RequireRole } from "@/components/auth/require-role";
import { CursadasView } from "@/components/academico/cursadas-view";

export default function CursadasPage() {
  return (
    <RequireRole allowedRoles={["ADMIN", "ADMINISTRATIVO"]}>
      <CursadasView />
    </RequireRole>
  );
}
```

```tsx
// frontend/components/academico/cursadas-view.tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function CursadasView() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Gestión de Cursadas</h1>
      <p>Listado de Comisiones Activas.</p>
      <Link href="/dashboard/comisiones/1">
        <Button>Ver Comisión de Prueba (ID: 1)</Button>
      </Link>
    </div>
  );
}
```

- [ ] **Step 2: Commit**
```bash
git add frontend/app/dashboard/cursadas/page.tsx frontend/components/academico/cursadas-view.tsx
git commit -m "feat(frontend): skeleton for gestion de cursadas"
```

---

### Task 4: Dashboard de Comisión (Tabs Skeleton)
**Files:**
- Create: `frontend/app/dashboard/comisiones/[id]/page.tsx`
- Create: `frontend/components/academico/comision-dashboard.tsx`

- [ ] **Step 1: Create Page**
```tsx
// frontend/app/dashboard/comisiones/[id]/page.tsx
import { ComisionDashboard } from "@/components/academico/comision-dashboard";

export default function ComisionPage({ params }: { params: { id: string } }) {
  return <ComisionDashboard comisionId={params.id} />;
}
```

- [ ] **Step 2: Create Dashboard with Tabs**
```tsx
// frontend/components/academico/comision-dashboard.tsx
"use client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function ComisionDashboard({ comisionId }: { comisionId: string }) {
  return (
    <div className="space-y-6">
      <div className="border-b pb-4">
        <h1 className="text-3xl font-bold">Comisión {comisionId}</h1>
        <p className="text-muted-foreground">Materia: Programación I | Profesor: Juan Pérez</p>
      </div>

      <Tabs defaultValue="alumnos" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="alumnos">Alumnos Inscriptos</TabsTrigger>
          <TabsTrigger value="notas">Exámenes y Notas</TabsTrigger>
          <TabsTrigger value="asistencias">Asistencias</TabsTrigger>
        </TabsList>
        <TabsContent value="alumnos">
          <div className="p-4 border rounded-md mt-4">Lista de Alumnos</div>
        </TabsContent>
        <TabsContent value="notas">
          <div className="p-4 border rounded-md mt-4">Gestión de Notas</div>
        </TabsContent>
        <TabsContent value="asistencias">
          <div className="p-4 border rounded-md mt-4">Toma de Asistencia</div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

- [ ] **Step 3: Commit**
```bash
git add frontend/app/dashboard/comisiones/ frontend/components/academico/
git commit -m "feat(frontend): create comision dashboard with tabs"
```
