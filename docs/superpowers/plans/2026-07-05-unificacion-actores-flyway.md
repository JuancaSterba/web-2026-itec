# Unificación de Actores (Legajo Único) + Adopción de Flyway Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** (A) Centralizar `legajo` en `User` (todos los roles, generado una única vez, inmutable). (B) Permitir agregarle un rol nuevo a una persona ya existente (por DNI) sin duplicar el `User`. (C) Adoptar Flyway como dueño único del schema, estandarizando el desarrollo en MySQL (se elimina el perfil `dev`/H2).

**Architecture:** Se mantiene la composición ya existente (`User` con `roles: Set<Rol>` + entidades satélite `Alumno`/`Profesor` vía `@OneToOne`, sin datos personales duplicados). El único punto de creación de `User` para altas de un paso (`UserLookupPortImpl.crearConCredencialesPorDni`) pasa a soportar dos caminos: crear un `User` nuevo (DNI inexistente) o adjuntar un rol a un `User` existente (DNI ya registrado). `UserAdminServiceImpl.crear()` y `AdminInitializer` se refactorizan para pasar por ese mismo punto único, en vez de construir `User` a mano cada uno por su lado. Flyway se corta al final, sobre el schema ya estabilizado por las Partes A y B.

**Tech Stack:** Spring Boot 3.2.5 / Java 17 (JPA/Hibernate), MySQL 8 (Docker), Flyway 9.x (`flyway-core` + `flyway-mysql`), Next.js/React (TypeScript, sin Zod/Yup).

## Global Constraints

- Spec de referencia: `docs/superpowers/specs/2026-07-05-unificacion-actores-flyway-design.md`.
- Proyecto en fase de desarrollo: no hace falta migrar datos existentes, toda la infraestructura (incluido el dev H2 que se elimina) es recreable desde cero.
- Sin tests de controller/repositorio en este repo; los únicos tests existentes son unitarios con Mockito puro (`AlumnoInscriptoServiceImplTest`, `UserAdminServiceImplTest`) — mismo criterio para código nuevo: no se agregan tests de controller/repo, solo se ajustan los tests Mockito existentes que este plan rompe.
- Sin tests de frontend en todo el repo — verificación es `tsc --noEmit`.
- DNI regex `^\d{7,8}$`, teléfono regex `^\d{6,15}$` — mismos patrones ya usados en el resto del proyecto.
- `legajo` formato `AAAA-DNI` (año de la fecha de alta + DNI), igual que hoy, pero generado en un solo lugar (Task 2) y nunca recalculado.
- Verificación de cada task de backend: `mvn compile` (o `mvn test` cuando el task toca un archivo con test existente). Verificación end-to-end: Task 16 (Docker + curl + navegador).

---

### Task 1: `User` y `Alumno` — mover `legajo`

**Files:**
- Modify: `backend/commons/src/main/java/ar/edu/itec1misiones/model/User.java`
- Modify: `backend/core/src/main/java/ar/edu/itec1misiones/model/Alumno.java`

**Interfaces:**
- Produces: `User.getLegajo()/setLegajo(String)` — usado por Tasks 2, 4, 7, 9, 12, 13.

- [ ] **Step 1: Agregar `legajo` a `User`**

En `User.java`, después de la línea `private String telefonoSecundario;`, agregar:
```java
    @Column(unique = true)
    private String legajo;
```

- [ ] **Step 2: Quitar `legajo` de `Alumno`**

En `Alumno.java`, reemplazar el archivo completo:
```java
package ar.edu.itec1misiones.model;

import jakarta.persistence.*;
import lombok.*;

import java.util.*;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Alumno {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private boolean activo = true;

    @OneToMany(mappedBy = "alumno", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<AlumnoCarrera> carreras = new ArrayList<>();

    @OneToOne
    @JoinColumn(name = "user_id", referencedColumnName = "id")
    private User user;
}
```

- [ ] **Step 3: Compilar `commons` y `core`**

Run: `cd backend && mvn -pl commons,core -am compile -q`
Expected: falla citando `AlumnoServiceImpl.java`/`AlumnoRepository.java`/`AlumnoResponse.java`/`AlumnoUpdateRequest.java` (usan `Alumno.getLegajo()`/`setLegajo()`/`existsByLegajo` que ya no existen) — esperado, se arregla en Tasks 3 y 4. No revertir nada, seguir al Task 2.

- [ ] **Step 4: Commit**

```bash
git add backend/commons/src/main/java/ar/edu/itec1misiones/model/User.java backend/core/src/main/java/ar/edu/itec1misiones/model/Alumno.java
git commit -m "feat(backend): mover legajo de Alumno a User (universal para todos los roles)"
```

---

### Task 2: Generación centralizada de `legajo`

**Files:**
- Create: `backend/commons/src/main/java/ar/edu/itec1misiones/util/LegajoGenerator.java`
- Modify: `backend/security/src/main/java/ar/edu/itec1misiones/security/service/UserLookupPortImpl.java`

**Interfaces:**
- Consumes: `User.setLegajo(String)` (Task 1).
- Produces: `LegajoGenerator.generar(String dni): String` — usado por Tasks 12, 13.

- [ ] **Step 1: Crear `LegajoGenerator`**

```java
package ar.edu.itec1misiones.util;

import java.time.LocalDate;

/**
 * Formato AAAA-DNI (anio de alta + DNI). Se llama una unica vez, en el
 * primer alta de la persona -- el legajo es identidad de por vida y no
 * se recalcula aunque mas adelante se le agregue un rol en otro anio.
 */
public final class LegajoGenerator {

    private LegajoGenerator() {
    }

    public static String generar(String dni) {
        return LocalDate.now().getYear() + "-" + dni;
    }
}
```

- [ ] **Step 2: Setear `legajo` al crear un `User` nuevo en `UserLookupPortImpl`**

En `UserLookupPortImpl.java`, reemplazar:
```java
import ar.edu.itec1misiones.model.Rol;
import ar.edu.itec1misiones.model.User;
import ar.edu.itec1misiones.security.repository.UserRepository;
import ar.edu.itec1misiones.service.UserLookupPort;
```
por:
```java
import ar.edu.itec1misiones.model.Rol;
import ar.edu.itec1misiones.model.User;
import ar.edu.itec1misiones.security.repository.UserRepository;
import ar.edu.itec1misiones.service.UserLookupPort;
import ar.edu.itec1misiones.util.LegajoGenerator;
```

Reemplazar:
```java
        User user = new User();
        user.setUsername(dni);
        user.setPassword(passwordEncoder.encode(dni));
        user.setRoles(Set.of(rol));
        user.setNombre(nombre);
        user.setApellido(apellido);
        user.setDni(dni);
        user.setEmail(email);
        user.setTelefono(telefono);
        user.setTelefonoSecundario(telefonoSecundario);
        // Alumnos/Profesores no tienen UI propia todavia: la cuenta se crea
        // deshabilitada para que no puedan loguearse (ver Reglas_de_Negocio.md).
        user.setEnabled(false);

        return userRepository.save(user);
    }
```
por:
```java
        User user = new User();
        user.setUsername(dni);
        user.setPassword(passwordEncoder.encode(dni));
        user.setRoles(Set.of(rol));
        user.setNombre(nombre);
        user.setApellido(apellido);
        user.setDni(dni);
        user.setEmail(email);
        user.setTelefono(telefono);
        user.setTelefonoSecundario(telefonoSecundario);
        user.setLegajo(LegajoGenerator.generar(dni));
        // ADMIN/ADMINISTRATIVO tienen login inmediato; Alumnos/Profesores no
        // tienen UI propia todavia y la cuenta se crea deshabilitada (ver
        // Reglas_de_Negocio.md).
        user.setEnabled(rol == Rol.ADMIN || rol == Rol.ADMINISTRATIVO);

        return userRepository.save(user);
    }
```

Nota: este cambio de `enabled` es un requisito de la Task 12 (cuando `UserAdminServiceImpl.crear()` empiece a llamar a este método, necesita que el `User` quede habilitado). No afecta a Alumno/Profesor (`rol` nunca es ADMIN/ADMINISTRATIVO en esos flujos).

- [ ] **Step 3: Compilar**

Run: `cd backend && mvn -pl commons,security -am compile -q`
Expected: `BUILD SUCCESS`

- [ ] **Step 4: Commit**

```bash
git add backend/commons/src/main/java/ar/edu/itec1misiones/util/LegajoGenerator.java backend/security/src/main/java/ar/edu/itec1misiones/security/service/UserLookupPortImpl.java
git commit -m "feat(backend): generar legajo universal al crear un User nuevo"
```

---

### Task 3: `AlumnoRepository` — legajo vive en `User`

**Files:**
- Modify: `backend/core/src/main/java/ar/edu/itec1misiones/repository/AlumnoRepository.java`

**Interfaces:**
- Produces: `AlumnoRepository.findByUserLegajo(String legajo): Optional<Alumno>` — usado por Task 4.

- [ ] **Step 1: Reemplazar los métodos de legajo**

Reemplazar el archivo completo:
```java
package ar.edu.itec1misiones.repository;

import ar.edu.itec1misiones.model.Alumno;
import ar.edu.itec1misiones.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.*;

import java.util.List;
import java.util.Optional;

@Repository
public interface AlumnoRepository extends JpaRepository<Alumno, Long> {
    Optional<Alumno> findByUser(User user);
    Optional<Alumno> findByUserId(Long userId);
    Optional<Alumno> findByUserLegajo(String legajo);
    Optional<Alumno> findByUserDni(String dni);
    List<Alumno> findByActivoTrue();
}
```

Nota: se sacan `findByLegajo`, `existsByLegajo` y `existsByLegajoAndIdNot` — ya no aplican, `legajo` deja de ser editable desde `Alumno` (ver Task 4).

- [ ] **Step 2: Compilar**

Run: `cd backend && mvn -pl core -am compile -q`
Expected: falla en `AlumnoServiceImpl.java` (usa `findByLegajo`/`existsByLegajo`) — esperado, se arregla en Task 4.

- [ ] **Step 3: Commit**

```bash
git add backend/core/src/main/java/ar/edu/itec1misiones/repository/AlumnoRepository.java
git commit -m "refactor(backend): AlumnoRepository busca legajo via User"
```

---

### Task 4: DTOs y Services — `legajo` de solo lectura desde `User`

**Files:**
- Modify: `backend/core/src/main/java/ar/edu/itec1misiones/dto/request/AlumnoUpdateRequest.java`
- Modify: `backend/core/src/main/java/ar/edu/itec1misiones/dto/response/AlumnoResponse.java`
- Modify: `backend/core/src/main/java/ar/edu/itec1misiones/dto/response/ProfesorResponse.java`
- Modify: `backend/core/src/main/java/ar/edu/itec1misiones/service/impl/AlumnoServiceImpl.java`
- Modify: `backend/core/src/main/java/ar/edu/itec1misiones/service/impl/ProfesorServiceImpl.java`
- Modify: `backend/commons/src/main/java/ar/edu/itec1misiones/dto/response/UsuarioAdminResponse.java`

**Interfaces:**
- Consumes: `User.getLegajo()` (Task 1), `AlumnoRepository.findByUserLegajo(String)` (Task 3).
- Produces: `ProfesorResponse.legajo`, `UsuarioAdminResponse.legajo` — usados por Tasks 5 (frontend) y 12 (`UserAdminServiceImpl`).

- [ ] **Step 1: `AlumnoUpdateRequest` pierde `legajo`**

Archivo completo:
```java
package ar.edu.itec1misiones.dto.request;

import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class AlumnoUpdateRequest {

    private boolean activo;

    @Pattern(regexp = "^$|\\d{6,15}", message = "El teléfono secundario debe contener entre 6 y 15 números")
    private String telefonoSecundario;
}
```

- [ ] **Step 2: `AlumnoResponse` sin cambios de campos** (ya tiene `legajo`, ahora se lee de `user.getLegajo()` en el service — ver Step 4). No requiere edición de este archivo.

- [ ] **Step 3: `ProfesorResponse` gana `legajo`**

Archivo completo:
```java
package ar.edu.itec1misiones.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProfesorResponse {
    private Long id;
    private String titulo;
    private String telefonoSecundario;
    private boolean activo;
    private Long userId;
    private String username;
    private String legajo;
    private String nombre;
    private String apellido;
    private String dni;
    private String email;
    private String telefono;
}
```

- [ ] **Step 4: `AlumnoServiceImpl` — `actualizar()` y `toResponse()` sin legajo editable**

Reemplazar el método `actualizar`:
```java
    @Override
    public AlumnoResponse actualizar(Long id, AlumnoUpdateRequest request) {
        Alumno alumno = alumnoRepository.findById(id)
                .orElseThrow(() -> new AlumnoNotFoundException(id));

        alumno.setActivo(request.isActivo());
        alumno.getUser().setTelefonoSecundario(request.getTelefonoSecundario());

        return toResponse(alumnoRepository.save(alumno));
    }
```

Reemplazar el método `buscarPorLegajo`:
```java
    @Override
    @Transactional(readOnly = true)
    public AlumnoResponse buscarPorLegajo(String legajo) {
        return toResponse(alumnoRepository.findByUserLegajo(legajo)
                .orElseThrow(() -> new AlumnoNotFoundException("legajo", legajo)));
    }
```

Reemplazar el método `toResponse`:
```java
    private AlumnoResponse toResponse(Alumno alumno) {
        User user = alumno.getUser();
        return AlumnoResponse.builder()
                .id(alumno.getId())
                .legajo(user.getLegajo())
                .activo(alumno.isActivo())
                .userId(user.getId())
                .username(user.getUsername())
                .nombre(user.getNombre())
                .apellido(user.getApellido())
                .dni(user.getDni())
                .email(user.getEmail())
                .telefono(user.getTelefono())
                .telefonoSecundario(user.getTelefonoSecundario())
                .build();
    }
```

Nota: `crearConUsuario()` no cambia en esta task (ya no tiene lógica de legajo local desde la Task 10 de este plan — ver más abajo, esa limpieza se hace en Parte B porque está atada al cambio de `UserLookupPort`; hasta entonces sigue compilando porque `AlumnoRegistroDTO`/`crearConUsuario` no tocan `alumno.setLegajo(...)` directamente en ningún punto de este archivo salvo el bloque que ya se va a reemplazar en Task 10).

- [ ] **Step 5: `ProfesorServiceImpl.toResponse()` incluye `legajo`**

Reemplazar el método `toResponse`:
```java
    private ProfesorResponse toResponse(Profesor profesor) {
        User user = profesor.getUser();
        return ProfesorResponse.builder()
                .id(profesor.getId())
                .titulo(profesor.getTitulo())
                .telefonoSecundario(user.getTelefonoSecundario())
                .activo(profesor.isActivo())
                .userId(user.getId())
                .username(user.getUsername())
                .legajo(user.getLegajo())
                .nombre(user.getNombre())
                .apellido(user.getApellido())
                .dni(user.getDni())
                .email(user.getEmail())
                .telefono(user.getTelefono())
                .build();
    }
```

- [ ] **Step 6: `UsuarioAdminResponse` gana `legajo`**

Archivo completo:
```java
package ar.edu.itec1misiones.dto.response;

import ar.edu.itec1misiones.model.Rol;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UsuarioAdminResponse {
    private Long id;
    private String username;
    private String legajo;
    private String nombre;
    private String apellido;
    private String dni;
    private String email;
    private String telefono;
    private Rol rol;
    private boolean enabled;
}
```

- [ ] **Step 7: Compilar `core` y `commons`**

Run: `cd backend && mvn -pl commons,core -am compile -q`
Expected: `BUILD SUCCESS` (el módulo `security` todavía no compila — `UserAdminServiceImpl.toResponse()` no llena el nuevo campo `legajo` de `UsuarioAdminResponse`, pero eso no rompe el compile, Lombok `@Builder` no exige todos los campos. `BUILD SUCCESS` esperado también en `security` si se corre `mvn -pl commons,core,security -am compile -q`).

- [ ] **Step 8: Commit**

```bash
git add backend/core/src/main/java/ar/edu/itec1misiones/dto/request/AlumnoUpdateRequest.java backend/core/src/main/java/ar/edu/itec1misiones/dto/response/ProfesorResponse.java backend/core/src/main/java/ar/edu/itec1misiones/service/impl/AlumnoServiceImpl.java backend/core/src/main/java/ar/edu/itec1misiones/service/impl/ProfesorServiceImpl.java backend/commons/src/main/java/ar/edu/itec1misiones/dto/response/UsuarioAdminResponse.java
git commit -m "feat(backend): legajo de solo lectura en Alumno/Profesor/Administrador"
```

---

### Task 5: Frontend — `legajo` de solo lectura en los 3 formularios

**Files:**
- Modify: `frontend/lib/services/alumnos.service.ts`
- Modify: `frontend/components/alumnos/alumno-form-dialog.tsx`
- Modify: `frontend/lib/services/profesores.service.ts`
- Modify: `frontend/components/profesores/profesor-form-dialog.tsx`
- Modify: `frontend/lib/services/administradores.service.ts`
- Modify: `frontend/components/administradores/administrador-form-dialog.tsx`

**Interfaces:**
- Consumes: `AlumnoResponse.legajo` (ya existía), `ProfesorResponse.legajo`, `UsuarioAdminResponse.legajo` (Task 4).

- [ ] **Step 1: `alumnos.service.ts` — `ActualizarAlumnoInput` pierde `legajo`**

Reemplazar:
```typescript
// AlumnoUpdateRequest del Core: legajo, estado activo y telefonoSecundario son editables.
export interface ActualizarAlumnoInput {
  legajo: string
  activo: boolean
  telefonoSecundario?: string
}
```
por:
```typescript
// AlumnoUpdateRequest del Core: legajo NO es editable (vive en el Usuario,
// es identidad de por vida); solo estado activo y telefonoSecundario.
export interface ActualizarAlumnoInput {
  activo: boolean
  telefonoSecundario?: string
}
```

- [ ] **Step 2: `alumno-form-dialog.tsx` — legajo pasa al banner de solo lectura**

Reemplazar:
```typescript
const emptyForm = {
  nombre: "",
  apellido: "",
  dni: "",
  email: "",
  telefono: "",
  telefonoSecundario: "",
  legajo: "",
}
```
por:
```typescript
const emptyForm = {
  nombre: "",
  apellido: "",
  dni: "",
  email: "",
  telefono: "",
  telefonoSecundario: "",
}
```

Reemplazar:
```typescript
      setForm({
        ...emptyForm,
        legajo: alumno?.legajo ?? "",
        telefonoSecundario: alumno?.telefonoSecundario ?? "",
      })
```
por:
```typescript
      setForm({
        ...emptyForm,
        telefonoSecundario: alumno?.telefonoSecundario ?? "",
      })
```

Reemplazar:
```typescript
      if (isEditing) {
        const actualizado = await actualizarAlumno(alumno!.id, {
          legajo: form.legajo.trim(),
          activo,
          telefonoSecundario: form.telefonoSecundario.trim(),
        })
        toast.success("Alumno actualizado correctamente")
        onSuccess(actualizado)
      } else {
        const { legajo, ...datosAlta } = form
        const creado = await crearAlumno(datosAlta)
```
por:
```typescript
      if (isEditing) {
        const actualizado = await actualizarAlumno(alumno!.id, {
          activo,
          telefonoSecundario: form.telefonoSecundario.trim(),
        })
        toast.success("Alumno actualizado correctamente")
        onSuccess(actualizado)
      } else {
        const creado = await crearAlumno(form)
```

Reemplazar el banner de solo lectura (bloque `isEditing &&` con nombre/apellido/DNI) y el bloque de legajo editable:
```tsx
          {isEditing && (
            <div className="rounded-md border border-border bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
              {alumno!.nombre} {alumno!.apellido} · DNI {alumno!.dni}
            </div>
          )}
```
por:
```tsx
          {isEditing && (
            <div className="rounded-md border border-border bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
              {alumno!.nombre} {alumno!.apellido} · DNI {alumno!.dni} · Legajo {alumno!.legajo}
            </div>
          )}
```

Y eliminar el bloque del campo `legajo` editable:
```tsx
          {isEditing && (
            <div className="space-y-2">
              <Label htmlFor="legajo">Legajo</Label>
              <Input
                id="legajo"
                value={form.legajo}
                onChange={setField("legajo")}
                disabled={submitting}
              />
            </div>
          )}

```
(se borra completo, sin reemplazo — el legajo ya se muestra en el banner de arriba).

- [ ] **Step 3: `profesores.service.ts` — `Profesor` gana `legajo`**

Reemplazar:
```typescript
export interface Profesor {
  id: number
  titulo: string
  telefonoSecundario: string
  activo: boolean
  userId: number
  username: string
  nombre: string
  apellido: string
  dni: string
  email: string
  telefono: string
}
```
por:
```typescript
export interface Profesor {
  id: number
  titulo: string
  telefonoSecundario: string
  activo: boolean
  userId: number
  username: string
  legajo: string
  nombre: string
  apellido: string
  dni: string
  email: string
  telefono: string
}
```

- [ ] **Step 4: `profesor-form-dialog.tsx` — legajo en el banner**

Reemplazar:
```tsx
          {isEditing && (
            <div className="rounded-md border border-border bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
              {profesor!.nombre} {profesor!.apellido} · DNI {profesor!.dni}
            </div>
          )}
```
por:
```tsx
          {isEditing && (
            <div className="rounded-md border border-border bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
              {profesor!.nombre} {profesor!.apellido} · DNI {profesor!.dni} · Legajo {profesor!.legajo}
            </div>
          )}
```

- [ ] **Step 5: `administradores.service.ts` — `Administrador` gana `legajo`**

Reemplazar:
```typescript
export interface Administrador {
  id: number
  username: string
  nombre: string
  apellido: string
  dni: string
  email: string
  telefono: string
  rol: RolAdministrador
  enabled: boolean
}
```
por:
```typescript
export interface Administrador {
  id: number
  username: string
  legajo: string
  nombre: string
  apellido: string
  dni: string
  email: string
  telefono: string
  rol: RolAdministrador
  enabled: boolean
}
```

- [ ] **Step 6: `administrador-form-dialog.tsx` — legajo visible en edición**

Este formulario no tiene banner de solo lectura (edita nombre/apellido/email/teléfono directamente). Agregar el legajo como texto informativo, reemplazando:
```tsx
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar administrador" : "Nuevo administrador"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Datos de contacto, rol y estado son editables desde acá."
              : "El sistema crea automáticamente el usuario (username y contraseña = DNI)."}
          </DialogDescription>
        </DialogHeader>
```
por:
```tsx
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar administrador" : "Nuevo administrador"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? `Legajo ${administrador?.legajo}. Datos de contacto, rol y estado son editables desde acá.`
              : "El sistema crea automáticamente el usuario (username y contraseña = DNI)."}
          </DialogDescription>
        </DialogHeader>
```

- [ ] **Step 7: Typecheck**

Run: `cd frontend && npx tsc --noEmit 2>&1 | grep -iE "alumno|profesor|administrador"`
Expected: sin salida.

- [ ] **Step 8: Commit**

```bash
git add frontend/lib/services/alumnos.service.ts frontend/components/alumnos/alumno-form-dialog.tsx frontend/lib/services/profesores.service.ts frontend/components/profesores/profesor-form-dialog.tsx frontend/lib/services/administradores.service.ts frontend/components/administradores/administrador-form-dialog.tsx
git commit -m "feat(frontend): legajo de solo lectura visible en Alumno/Profesor/Administrador"
```

---

### Task 6: `UserRepository.findByDni`

**Files:**
- Modify: `backend/security/src/main/java/ar/edu/itec1misiones/security/repository/UserRepository.java`

**Interfaces:**
- Produces: `UserRepository.findByDni(String dni): Optional<User>` — usado por Tasks 7 y 9.

- [ ] **Step 1: Agregar el método**

Reemplazar:
```java
    Optional<User> findByUsername(String username);
    boolean existsByUsername(String username);
    boolean existsByDni(String dni);
    boolean existsByEmail(String email);
```
por:
```java
    Optional<User> findByUsername(String username);
    Optional<User> findByDni(String dni);
    boolean existsByUsername(String username);
    boolean existsByDni(String dni);
    boolean existsByEmail(String email);
```

- [ ] **Step 2: Compilar**

Run: `cd backend && mvn -pl security -am compile -q`
Expected: `BUILD SUCCESS`

- [ ] **Step 3: Commit**

```bash
git add backend/security/src/main/java/ar/edu/itec1misiones/security/repository/UserRepository.java
git commit -m "feat(backend): UserRepository.findByDni"
```

---

### Task 7: `PersonaResumenResponse` + `UserLookupPort.buscarPorDni`

**Files:**
- Create: `backend/commons/src/main/java/ar/edu/itec1misiones/dto/response/PersonaResumenResponse.java`
- Modify: `backend/core/src/main/java/ar/edu/itec1misiones/service/UserLookupPort.java`
- Modify: `backend/security/src/main/java/ar/edu/itec1misiones/security/service/UserLookupPortImpl.java`

**Interfaces:**
- Consumes: `UserRepository.findByDni(String)` (Task 6).
- Produces: `UserLookupPort.buscarPorDni(String dni): Optional<PersonaResumenResponse>` — usado por Task 8.

- [ ] **Step 1: Crear `PersonaResumenResponse`**

```java
package ar.edu.itec1misiones.dto.response;

import ar.edu.itec1misiones.model.Rol;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

/**
 * Resumen de una persona ya existente en el sistema (cualquiera sea su rol
 * actual), usado para el auto-detect por DNI en los formularios de alta:
 * si existe, el frontend oculta los datos personales y solo pide los
 * campos propios del rol nuevo a agregar.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PersonaResumenResponse {
    private String nombre;
    private String apellido;
    private String email;
    private String telefono;
    private String legajo;
    private Set<Rol> roles;
}
```

- [ ] **Step 2: Agregar el método a la interfaz `UserLookupPort`**

Reemplazar:
```java
package ar.edu.itec1misiones.service;

import ar.edu.itec1misiones.model.Rol;
import ar.edu.itec1misiones.model.User;

import java.util.Optional;

public interface UserLookupPort {
    Optional<User> findById(Long id);
```
por:
```java
package ar.edu.itec1misiones.service;

import ar.edu.itec1misiones.dto.response.PersonaResumenResponse;
import ar.edu.itec1misiones.model.Rol;
import ar.edu.itec1misiones.model.User;

import java.util.Optional;

public interface UserLookupPort {
    Optional<User> findById(Long id);

    /**
     * Resumen de una persona ya existente por DNI (cualquiera sea su rol),
     * para que el frontend detecte "esta persona ya existe" antes de dar de
     * alta un rol nuevo. Vacio si el DNI no esta registrado.
     */
    Optional<PersonaResumenResponse> buscarPorDni(String dni);
```

- [ ] **Step 3: Implementar en `UserLookupPortImpl`**

Agregar el método (después de `findById`):
```java
    @Override
    public Optional<PersonaResumenResponse> buscarPorDni(String dni) {
        return userRepository.findByDni(dni).map(user -> PersonaResumenResponse.builder()
                .nombre(user.getNombre())
                .apellido(user.getApellido())
                .email(user.getEmail())
                .telefono(user.getTelefono())
                .legajo(user.getLegajo())
                .roles(user.getRoles())
                .build());
    }
```

Agregar el import correspondiente:
```java
import ar.edu.itec1misiones.dto.response.PersonaResumenResponse;
```

- [ ] **Step 4: Compilar**

Run: `cd backend && mvn -pl commons,core,security -am compile -q`
Expected: `BUILD SUCCESS`

- [ ] **Step 5: Commit**

```bash
git add backend/commons/src/main/java/ar/edu/itec1misiones/dto/response/PersonaResumenResponse.java backend/core/src/main/java/ar/edu/itec1misiones/service/UserLookupPort.java backend/security/src/main/java/ar/edu/itec1misiones/security/service/UserLookupPortImpl.java
git commit -m "feat(backend): UserLookupPort.buscarPorDni para auto-detect de persona existente"
```

---

### Task 8: `PersonaController` — endpoint de auto-detección

**Files:**
- Create: `backend/core/src/main/java/ar/edu/itec1misiones/exception/PersonaNotFoundException.java`
- Create: `backend/core/src/main/java/ar/edu/itec1misiones/controller/PersonaController.java`
- Modify: `backend/core/src/main/java/ar/edu/itec1misiones/exception/CoreExceptionHandler.java`

**Interfaces:**
- Consumes: `UserLookupPort.buscarPorDni(String)` (Task 7).

- [ ] **Step 1: Crear la excepción**

```java
package ar.edu.itec1misiones.exception;

public class PersonaNotFoundException extends RuntimeException {
    public PersonaNotFoundException(String dni) {
        super("No existe ninguna persona registrada con DNI: " + dni);
    }
}
```

- [ ] **Step 2: Crear el controller**

```java
package ar.edu.itec1misiones.controller;

import ar.edu.itec1misiones.dto.ApiResponse;
import ar.edu.itec1misiones.dto.response.MetaBuilderHelper;
import ar.edu.itec1misiones.dto.response.PersonaResumenResponse;
import ar.edu.itec1misiones.exception.PersonaNotFoundException;
import ar.edu.itec1misiones.service.UserLookupPort;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/personas")
@Tag(name = "Personas", description = "Búsqueda de personas ya registradas por DNI (auto-detect en altas)")
public class PersonaController {

    private final UserLookupPort userLookupPort;

    public PersonaController(UserLookupPort userLookupPort) {
        this.userLookupPort = userLookupPort;
    }

    @GetMapping("/dni/{dni}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('ADMINISTRATIVO')")
    @Operation(summary = "Buscar si ya existe una persona con ese DNI (cualquier rol)")
    public ResponseEntity<ApiResponse<PersonaResumenResponse>> buscarPorDni(
            @PathVariable String dni,
            HttpServletRequest httpRequest) {

        PersonaResumenResponse persona = userLookupPort.buscarPorDni(dni)
                .orElseThrow(() -> new PersonaNotFoundException(dni));

        return ResponseEntity.ok(
                ApiResponse.<PersonaResumenResponse>builder()
                        .meta(MetaBuilderHelper.buildMeta(httpRequest))
                        .data(List.of(persona))
                        .build()
        );
    }
}
```

- [ ] **Step 3: Registrar el handler en `CoreExceptionHandler`**

Agregar, después del método `handleAlumnoNotFound` (o en cualquier punto de la clase):
```java
    @ExceptionHandler(PersonaNotFoundException.class)
    public ResponseEntity<ApiResponse<Object>> handlePersonaNotFound(
            PersonaNotFoundException ex,
            HttpServletRequest request) {

        ErrorDto error = new ErrorDto("PERSONA_NOT_FOUND", ex.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                ApiResponse.builder()
                        .meta(MetaBuilderHelper.buildMeta(request))
                        .errors(List.of(error))
                        .build()
        );
    }
```

- [ ] **Step 4: Compilar**

Run: `cd backend && mvn -pl core -am compile -q`
Expected: `BUILD SUCCESS`

- [ ] **Step 5: Commit**

```bash
git add backend/core/src/main/java/ar/edu/itec1misiones/exception/PersonaNotFoundException.java backend/core/src/main/java/ar/edu/itec1misiones/controller/PersonaController.java backend/core/src/main/java/ar/edu/itec1misiones/exception/CoreExceptionHandler.java
git commit -m "feat(backend): endpoint GET /api/personas/dni/{dni} para auto-detect"
```

---

### Task 9: Adjuntar rol a persona existente (`UserLookupPortImpl`)

**Files:**
- Create: `backend/core/src/main/java/ar/edu/itec1misiones/exception/RolYaAsignadoException.java`
- Modify: `backend/core/src/main/java/ar/edu/itec1misiones/exception/CoreExceptionHandler.java`
- Modify: `backend/security/src/main/java/ar/edu/itec1misiones/security/service/UserLookupPortImpl.java`

**Interfaces:**
- Produces: `UserLookupPort.crearConCredencialesPorDni(...)` ahora también adjunta rol a un `User` existente en vez de fallar por DNI duplicado — usado por Tasks 10, 12, 13.

- [ ] **Step 1: Crear la excepción**

```java
package ar.edu.itec1misiones.exception;

import ar.edu.itec1misiones.model.Rol;

public class RolYaAsignadoException extends RuntimeException {
    public RolYaAsignadoException(String dni, Rol rol) {
        super("La persona con DNI '" + dni + "' ya tiene el rol " + rol);
    }
}
```

- [ ] **Step 2: Registrar el handler**

Agregar en `CoreExceptionHandler.java`:
```java
    @ExceptionHandler(RolYaAsignadoException.class)
    public ResponseEntity<ApiResponse<Object>> handleRolYaAsignado(
            RolYaAsignadoException ex,
            HttpServletRequest request) {

        ErrorDto error = new ErrorDto("ROL_YA_ASIGNADO", ex.getMessage());
        return ResponseEntity.status(HttpStatus.CONFLICT).body(
                ApiResponse.builder()
                        .meta(MetaBuilderHelper.buildMeta(request))
                        .errors(List.of(error))
                        .build()
        );
    }
```

- [ ] **Step 3: `UserLookupPortImpl.crearConCredencialesPorDni` — rama de adjuntar rol**

Reemplazar el método completo:
```java
    @Override
    public User crearConCredencialesPorDni(String nombre, String apellido, String dni, String email,
                                            String telefono, String telefonoSecundario, Rol rol) {
        Optional<User> existente = userRepository.findByDni(dni);
        if (existente.isPresent()) {
            return adjuntarRol(existente.get(), rol);
        }

        List<String> errores = new ArrayList<>();
        if (userRepository.existsByUsername(dni)) {
            errores.add("Ya existe un usuario con username '" + dni + "'");
        }
        if (userRepository.existsByEmail(email)) {
            errores.add("El email '" + email + "' ya está en uso");
        }
        if (!errores.isEmpty()) {
            throw new IllegalArgumentException(String.join(". ", errores));
        }

        User user = new User();
        user.setUsername(dni);
        user.setPassword(passwordEncoder.encode(dni));
        user.setRoles(Set.of(rol));
        user.setNombre(nombre);
        user.setApellido(apellido);
        user.setDni(dni);
        user.setEmail(email);
        user.setTelefono(telefono);
        user.setTelefonoSecundario(telefonoSecundario);
        user.setLegajo(LegajoGenerator.generar(dni));
        // ADMIN/ADMINISTRATIVO tienen login inmediato; Alumnos/Profesores no
        // tienen UI propia todavia y la cuenta se crea deshabilitada (ver
        // Reglas_de_Negocio.md).
        user.setEnabled(rol == Rol.ADMIN || rol == Rol.ADMINISTRATIVO);

        return userRepository.save(user);
    }

    private User adjuntarRol(User user, Rol rol) {
        if (user.getRoles().contains(rol)) {
            throw new RolYaAsignadoException(user.getDni(), rol);
        }

        Set<Rol> nuevosRoles = new HashSet<>(user.getRoles());
        nuevosRoles.add(rol);
        user.setRoles(nuevosRoles);

        // Si el rol nuevo requiere login inmediato, se habilita la cuenta
        // (nunca se deshabilita una cuenta que ya estaba habilitada).
        if (rol == Rol.ADMIN || rol == Rol.ADMINISTRATIVO) {
            user.setEnabled(true);
        }

        return userRepository.save(user);
    }
```

Nota: el `import ar.edu.itec1misiones.exception.RolYaAsignadoException;` y `import ar.edu.itec1misiones.exception.PersonaNotFoundException;` — solo el primero hace falta acá. Agregar también `import java.util.HashSet;` si no está.

- [ ] **Step 4: Compilar**

Run: `cd backend && mvn -pl core,security -am compile -q`
Expected: `BUILD SUCCESS`

- [ ] **Step 5: Commit**

```bash
git add backend/core/src/main/java/ar/edu/itec1misiones/exception/RolYaAsignadoException.java backend/core/src/main/java/ar/edu/itec1misiones/exception/CoreExceptionHandler.java backend/security/src/main/java/ar/edu/itec1misiones/security/service/UserLookupPortImpl.java
git commit -m "feat(backend): adjuntar rol nuevo a persona existente en vez de fallar por DNI duplicado"
```

---

### Task 10: `AlumnoServiceImpl`/`ProfesorServiceImpl` — sin legajo local

**Files:**
- Modify: `backend/core/src/main/java/ar/edu/itec1misiones/service/impl/AlumnoServiceImpl.java`

**Interfaces:**
- Consumes: `UserLookupPort.crearConCredencialesPorDni(...)` (Task 9, ya adjunta rol si el DNI existe).

- [ ] **Step 1: `crearConUsuario` sin variable `legajo` local**

Reemplazar el método completo:
```java
    @Override
    public AlumnoResponse crearConUsuario(AlumnoRegistroDTO dto) {
        // Si esto falla (DNI/email duplicado), la transaccion completa
        // se revierte -- no queda un Usuario huerfano sin Alumno asociado.
        // Si el DNI ya existe (persona con otro rol), userLookupPort le
        // adjunta el rol ALUMNO en vez de crear un Usuario nuevo.
        User user = userLookupPort.crearConCredencialesPorDni(
                dto.getNombre(), dto.getApellido(), dto.getDni(), dto.getEmail(),
                dto.getTelefono(), dto.getTelefonoSecundario(), Rol.ALUMNO);

        Alumno alumno = new Alumno();
        alumno.setUser(user);
        alumno.setActivo(true);

        return toResponse(alumnoRepository.save(alumno));
    }
```

Nota: no hace falta chequear si ya existe una fila `Alumno` para ese `User` — `userLookupPort.crearConCredencialesPorDni` ya tira `RolYaAsignadoException` si la persona ya tenía el rol ALUMNO, así que este código solo se alcanza cuando es la primera vez que esa persona recibe el rol ALUMNO (User nuevo o adjuntando el rol por primera vez).

También quitar, si quedó, el import de `java.time.LocalDate` y `alumnoRepository.existsByLegajo(...)` si el compilador los señala como no usados (no rompe el build, pero conviene limpiar).

- [ ] **Step 2: Compilar**

Run: `cd backend && mvn -pl core -am compile -q`
Expected: `BUILD SUCCESS`

- [ ] **Step 3: Commit**

```bash
git add backend/core/src/main/java/ar/edu/itec1misiones/service/impl/AlumnoServiceImpl.java
git commit -m "refactor(backend): AlumnoServiceImpl ya no genera legajo localmente"
```

---

### Task 11: Verificación manual — adjuntar rol (Alumno ↔ Profesor)

**Files:** ninguno (solo verificación).

- [ ] **Step 1: Levantar el backend local**

Run: `cd backend && mvn -pl api -am spring-boot:run` (perfil `local`, requiere Docker MySQL corriendo — ver Task 15/16 si todavía no está levantado).

- [ ] **Step 2: Crear un Alumno, después agregarle el rol Profesor con el mismo DNI**

```bash
TOKEN=$(curl -s -X POST http://localhost:8082/auth/login -H "Content-Type: application/json" -d '{"username":"admin","password":"admin123"}' | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

curl -s -w "\nSTATUS:%{http_code}\n" -X POST http://localhost:8082/api/alumnos -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"nombre":"Doble","apellido":"Rol","dni":"40999888","email":"doblerol@test.com","telefono":"3760055555"}'
# Expected: 201, alumno creado, legajo tipo "2026-40999888"

curl -s -w "\nSTATUS:%{http_code}\n" -X POST http://localhost:8082/api/profesores -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"nombre":"Doble","apellido":"Rol","dni":"40999888","email":"otro@test.com","telefono":"3760066666","titulo":"Ing.","telefonoSecundario":"3760077777"}'
# Expected: 201, profesor creado, MISMO legajo que el alumno (no se recalcula), mismo userId
```

- [ ] **Step 3: Verificar que reintentar el mismo rol falla con 409**

```bash
curl -s -w "\nSTATUS:%{http_code}\n" -X POST http://localhost:8082/api/alumnos -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"nombre":"Doble","apellido":"Rol","dni":"40999888","email":"otro2@test.com","telefono":"3760088888"}'
# Expected: STATUS:409, error ROL_YA_ASIGNADO
```

- [ ] **Step 4: Verificar el endpoint de auto-detect**

```bash
curl -s http://localhost:8082/api/personas/dni/40999888 -H "Authorization: Bearer $TOKEN"
# Expected: 200, roles: ["ALUMNO","PROFESOR"], legajo: "2026-40999888"

curl -s -w "\nSTATUS:%{http_code}\n" http://localhost:8082/api/personas/dni/00000000 -H "Authorization: Bearer $TOKEN"
# Expected: STATUS:404
```

---

### Task 12: `UserAdminServiceImpl.crear()` delega en `UserLookupPort`

**Files:**
- Modify: `backend/security/src/main/java/ar/edu/itec1misiones/security/service/impl/UserAdminServiceImpl.java`
- Modify: `backend/security/src/test/java/ar/edu/itec1misiones/security/service/impl/UserAdminServiceImplTest.java`

**Interfaces:**
- Consumes: `UserLookupPort.crearConCredencialesPorDni(...)` (Task 9).

- [ ] **Step 1: `UserAdminServiceImpl` — inyectar `UserLookupPort` y simplificar `crear()`**

Reemplazar el bloque de imports y constructor:
```java
import ar.edu.itec1misiones.dto.request.ActualizarAdministradorRequest;
import ar.edu.itec1misiones.dto.request.CrearAdministradorRequest;
import ar.edu.itec1misiones.dto.response.UsuarioAdminResponse;
import ar.edu.itec1misiones.model.Rol;
import ar.edu.itec1misiones.model.User;
import ar.edu.itec1misiones.security.exception.AdministradorDatosDuplicadosException;
import ar.edu.itec1misiones.security.exception.AdministradorNotFoundException;
import ar.edu.itec1misiones.security.exception.RolNoGestionableException;
import ar.edu.itec1misiones.security.exception.SelfActionNotAllowedException;
import ar.edu.itec1misiones.security.repository.UserRepository;
import ar.edu.itec1misiones.security.service.UserAdminService;
import ar.edu.itec1misiones.security.util.SecurityUtils;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@Transactional
public class UserAdminServiceImpl implements UserAdminService {

    private static final List<Rol> ROLES_GESTIONABLES = List.of(Rol.ADMIN, Rol.ADMINISTRATIVO);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserAdminServiceImpl(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }
```
por:
```java
import ar.edu.itec1misiones.dto.request.ActualizarAdministradorRequest;
import ar.edu.itec1misiones.dto.request.CrearAdministradorRequest;
import ar.edu.itec1misiones.dto.response.UsuarioAdminResponse;
import ar.edu.itec1misiones.model.Rol;
import ar.edu.itec1misiones.model.User;
import ar.edu.itec1misiones.security.exception.AdministradorDatosDuplicadosException;
import ar.edu.itec1misiones.security.exception.AdministradorNotFoundException;
import ar.edu.itec1misiones.security.exception.RolNoGestionableException;
import ar.edu.itec1misiones.security.exception.SelfActionNotAllowedException;
import ar.edu.itec1misiones.security.repository.UserRepository;
import ar.edu.itec1misiones.security.service.UserAdminService;
import ar.edu.itec1misiones.security.util.SecurityUtils;
import ar.edu.itec1misiones.service.UserLookupPort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@Transactional
public class UserAdminServiceImpl implements UserAdminService {

    private static final List<Rol> ROLES_GESTIONABLES = List.of(Rol.ADMIN, Rol.ADMINISTRATIVO);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserLookupPort userLookupPort;

    public UserAdminServiceImpl(UserRepository userRepository, PasswordEncoder passwordEncoder,
                                 UserLookupPort userLookupPort) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.userLookupPort = userLookupPort;
    }
```

Reemplazar el método `crear`:
```java
    @Override
    public UsuarioAdminResponse crear(CrearAdministradorRequest request) {
        validarRolGestionable(request.getRol());

        User user = userLookupPort.crearConCredencialesPorDni(
                request.getNombre(), request.getApellido(), request.getDni(), request.getEmail(),
                request.getTelefono(), null, request.getRol());

        return toResponse(user);
    }
```

Nota: `AdministradorDatosDuplicadosException` deja de lanzarse desde `crear()` (el `UserLookupPort` ahora tira `IllegalArgumentException`/`RolYaAsignadoException`, manejadas por `CoreExceptionHandler`, no por `SecurityExceptionHandler`). Es un cambio de contrato de errores documentado en el Task 12 Step 3 (ajuste de tests) — el frontend ya muestra `err.message` genérico en el catch, así que no requiere cambios de UI.

- [ ] **Step 2: Compilar**

Run: `cd backend && mvn -pl security -am compile -q`
Expected: falla en `UserAdminServiceImplTest.java` (tests de `crear` mockean `userRepository`/`passwordEncoder` directo, con `@InjectMocks` que ahora necesita también un mock de `UserLookupPort`) — esperado, se arregla en el Step 3.

- [ ] **Step 3: Ajustar los tests de `crear()` en `UserAdminServiceImplTest`**

Reemplazar:
```java
import ar.edu.itec1misiones.security.repository.UserRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;
import java.util.Optional;
import java.util.Set;
```
por:
```java
import ar.edu.itec1misiones.security.repository.UserRepository;
import ar.edu.itec1misiones.service.UserLookupPort;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;
import java.util.Optional;
import java.util.Set;
```

Reemplazar:
```java
    @Mock UserRepository userRepository;
    @Mock PasswordEncoder passwordEncoder;

    @InjectMocks UserAdminServiceImpl service;
```
por:
```java
    @Mock UserRepository userRepository;
    @Mock PasswordEncoder passwordEncoder;
    @Mock UserLookupPort userLookupPort;

    @InjectMocks UserAdminServiceImpl service;
```

Reemplazar el test `crear_lanzaAdministradorDatosDuplicadosException_siDniYaExiste`:
```java
    @Test
    void crear_lanzaAdministradorDatosDuplicadosException_siDniYaExiste() {
        CrearAdministradorRequest request = buildCrearRequest(Rol.ADMINISTRATIVO);
        when(userRepository.existsByUsername("30111222")).thenReturn(true);
        when(userRepository.existsByDni("30111222")).thenReturn(true);
        when(userRepository.existsByEmail(anyString())).thenReturn(false);

        assertThatThrownBy(() -> service.crear(request))
                .isInstanceOf(AdministradorDatosDuplicadosException.class);

        verify(userRepository, never()).save(any());
    }
```
por:
```java
    @Test
    void crear_propagaExcepcionDelPuerto_siDniYaEstaEnUso() {
        CrearAdministradorRequest request = buildCrearRequest(Rol.ADMINISTRATIVO);
        when(userLookupPort.crearConCredencialesPorDni(
                anyString(), anyString(), anyString(), anyString(), anyString(), any(), any()))
                .thenThrow(new IllegalArgumentException("El email '" + request.getEmail() + "' ya está en uso"));

        assertThatThrownBy(() -> service.crear(request))
                .isInstanceOf(IllegalArgumentException.class);

        verify(userRepository, never()).save(any());
    }
```

Reemplazar el test `crear_creaUsuarioConUsernameYPasswordIgualesAlDni_siDatosValidos`:
```java
    @Test
    void crear_creaUsuarioConUsernameYPasswordIgualesAlDni_siDatosValidos() {
        CrearAdministradorRequest request = buildCrearRequest(Rol.ADMIN);
        when(userRepository.existsByUsername(anyString())).thenReturn(false);
        when(userRepository.existsByDni(anyString())).thenReturn(false);
        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(passwordEncoder.encode("30111222")).thenReturn("HASH_30111222");
        when(userRepository.save(any(User.class))).thenAnswer(inv -> {
            User u = inv.getArgument(0);
            u.setId(1L);
            return u;
        });

        UsuarioAdminResponse response = service.crear(request);

        assertThat(response.getUsername()).isEqualTo("30111222");
        assertThat(response.isEnabled()).isTrue();
        assertThat(response.getRol()).isEqualTo(Rol.ADMIN);

        verify(userRepository).save(argThat(u ->
                u.getUsername().equals("30111222")
                        && u.getPassword().equals("HASH_30111222")
                        && u.isEnabled()
                        && u.getRoles().equals(Set.of(Rol.ADMIN))
        ));
    }
```
por:
```java
    @Test
    void crear_delegaEnUserLookupPortYMapeaLaRespuesta_siDatosValidos() {
        CrearAdministradorRequest request = buildCrearRequest(Rol.ADMIN);
        User creado = buildUser(1L, "30111222", Rol.ADMIN, true);
        creado.setLegajo("2026-30111222");
        when(userLookupPort.crearConCredencialesPorDni(
                "Ana", "Gómez", "30111222", "ana@itec.edu.ar", "3760000000", null, Rol.ADMIN))
                .thenReturn(creado);

        UsuarioAdminResponse response = service.crear(request);

        assertThat(response.getUsername()).isEqualTo("30111222");
        assertThat(response.getLegajo()).isEqualTo("2026-30111222");
        assertThat(response.isEnabled()).isTrue();
        assertThat(response.getRol()).isEqualTo(Rol.ADMIN);

        verifyNoInteractions(userRepository);
    }
```

- [ ] **Step 4: Correr los tests**

Run: `cd backend && mvn -pl security -am test -q`
Expected: `BUILD SUCCESS`, todos los tests de `UserAdminServiceImplTest` en verde.

- [ ] **Step 5: Commit**

```bash
git add backend/security/src/main/java/ar/edu/itec1misiones/security/service/impl/UserAdminServiceImpl.java backend/security/src/test/java/ar/edu/itec1misiones/security/service/impl/UserAdminServiceImplTest.java
git commit -m "refactor(backend): UserAdminServiceImpl.crear() delega en UserLookupPort"
```

---

### Task 13: `AdminInitializer` usa `UserLookupPort`

**Files:**
- Modify: `backend/security/src/main/java/ar/edu/itec1misiones/security/config/AdminInitializer.java`

**Interfaces:**
- Consumes: `UserLookupPort.crearConCredencialesPorDni(...)` (Task 9).

- [ ] **Step 1: Reemplazar el archivo completo**

```java
package ar.edu.itec1misiones.security.config;

import ar.edu.itec1misiones.model.Profesor;
import ar.edu.itec1misiones.model.Rol;
import ar.edu.itec1misiones.model.User;
import ar.edu.itec1misiones.repository.ProfesorRepository;
import ar.edu.itec1misiones.security.repository.UserRepository;
import ar.edu.itec1misiones.service.UserLookupPort;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Component
public class AdminInitializer {

    private final UserRepository userRepository;
    private final ProfesorRepository profesorRepository;
    private final UserLookupPort userLookupPort;

    @Value("${admin.username}")
    private String username;
    @Value("${admin.nombre}")
    private String nombre;
    @Value("${admin.apellido}")
    private String apellido;
    @Value("${admin.dni}")
    private String dni;
    @Value("${admin.email}")
    private String email;
    @Value("${admin.telefono}")
    private String telefono;

    public AdminInitializer(UserRepository userRepository,
                            ProfesorRepository profesorRepository,
                            UserLookupPort userLookupPort) {
        this.userRepository = userRepository;
        this.profesorRepository = profesorRepository;
        this.userLookupPort = userLookupPort;
    }

    @EventListener(ApplicationReadyEvent.class)
    public void init() {
        if (userRepository.findByUsername(username).isPresent()) {
            return;
        }

        try {
            // ADMIN primero (User nuevo, username/password = DNI, legajo
            // autogenerado); PROFESOR despues adjunta el rol al mismo User
            // (mismo mecanismo que usa cualquier alta con DNI repetido).
            User user = userLookupPort.crearConCredencialesPorDni(
                    nombre, apellido, dni, email, telefono, null, Rol.ADMIN);
            userLookupPort.crearConCredencialesPorDni(
                    nombre, apellido, dni, email, telefono, null, Rol.PROFESOR);

            Profesor profesor = new Profesor();
            profesor.setUser(user);
            profesor.setActivo(true);
            profesorRepository.save(profesor);

            System.out.println("✅ Usuario administrador creado exitosamente.");
        } catch (RuntimeException e) {
            // DNI/Email duplicado u otro conflicto: no crashea el arranque.
            System.out.println("⚠️ No se pudo crear el administrador inicial: " + e.getMessage());
        }
    }
}
```

Nota: `admin.password` deja de usarse acá (el password del seed ADMIN siempre es su DNI, igual que cualquier alta por `UserLookupPort` — ya no se setea una password custom vía `${admin.password}`). Si `application-local.yml`/`application-prod.yml` definen `admin.password`, la propiedad queda sin uso pero no rompe nada (Spring no valida properties no consumidas). No se toca la config en esta task — se limpia si sobra tiempo, no es bloqueante.

- [ ] **Step 2: Compilar**

Run: `cd backend && mvn -pl security -am compile -q`
Expected: `BUILD SUCCESS`

- [ ] **Step 3: Commit**

```bash
git add backend/security/src/main/java/ar/edu/itec1misiones/security/config/AdminInitializer.java
git commit -m "refactor(backend): AdminInitializer usa UserLookupPort (legajo + adjuntar rol)"
```

---

### Task 14: Frontend — auto-detección de DNI en los 3 formularios de alta

**Files:**
- Create: `frontend/lib/services/personas.service.ts`
- Modify: `frontend/components/alumnos/alumno-form-dialog.tsx`
- Modify: `frontend/components/profesores/profesor-form-dialog.tsx`
- Modify: `frontend/components/administradores/administrador-form-dialog.tsx`

**Interfaces:**
- Consumes: `GET /api/core/personas/dni/{dni}` (Task 8, vía gateway).
- Produces: `buscarPersonaPorDni(dni: string): Promise<PersonaResumen | null>` — usado por los 3 form dialogs.

- [ ] **Step 1: Crear el servicio**

```typescript
import apiClient from "@/lib/api-client"

// Coincide con PersonaResumenResponse del Core.
export interface PersonaResumen {
  nombre: string
  apellido: string
  email: string
  telefono: string
  legajo: string
  roles: string[]
}

// Devuelve null si el DNI no esta registrado (404) -- no es un error de
// UI, es el caso esperado de "persona nueva" en el formulario de alta.
export async function buscarPersonaPorDni(dni: string): Promise<PersonaResumen | null> {
  try {
    const response = await apiClient.get<PersonaResumen[]>(`/api/core/personas/dni/${dni}`)
    return response.data[0] ?? null
  } catch (err: any) {
    if (err?.response?.status === 404) {
      return null
    }
    throw err
  }
}
```

- [ ] **Step 2: `alumno-form-dialog.tsx` — detectar DNI existente**

Reemplazar el import de servicios:
```typescript
import { actualizarAlumno, crearAlumno, type Alumno } from "@/lib/services/alumnos.service"
```
por:
```typescript
import { actualizarAlumno, crearAlumno, type Alumno } from "@/lib/services/alumnos.service"
import { buscarPersonaPorDni, type PersonaResumen } from "@/lib/services/personas.service"
```

Agregar estado y handler (después de `const [error, setError] = useState<string | null>(null)`):
```typescript
  const [personaExistente, setPersonaExistente] = useState<PersonaResumen | null>(null)

  const handleDniBlur = async () => {
    if (isEditing || !/^\d{7,8}$/.test(form.dni)) {
      setPersonaExistente(null)
      return
    }
    const persona = await buscarPersonaPorDni(form.dni).catch(() => null)
    setPersonaExistente(persona)
    if (persona) {
      setForm((prev) => ({
        ...prev,
        nombre: persona.nombre,
        apellido: persona.apellido,
        email: persona.email,
        telefono: persona.telefono,
      }))
    }
  }
```

Reemplazar el bloque del campo DNI (agregar `onBlur`):
```tsx
                <div className="space-y-2">
                  <Label htmlFor="dni">DNI</Label>
                  <Input
                    id="dni"
                    value={form.dni}
                    onChange={setField("dni")}
                    placeholder="Sin puntos, 7 u 8 dígitos"
                    disabled={submitting}
                  />
                </div>
```
por:
```tsx
                <div className="space-y-2">
                  <Label htmlFor="dni">DNI</Label>
                  <Input
                    id="dni"
                    value={form.dni}
                    onChange={setField("dni")}
                    onBlur={handleDniBlur}
                    placeholder="Sin puntos, 7 u 8 dígitos"
                    disabled={submitting}
                  />
                </div>
```

Agregar el banner y ocultar los campos personales cuando `personaExistente` no es null. Reemplazar:
```tsx
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre</Label>
                  <Input id="nombre" value={form.nombre} onChange={setField("nombre")} disabled={submitting} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="apellido">Apellido</Label>
                  <Input id="apellido" value={form.apellido} onChange={setField("apellido")} disabled={submitting} />
                </div>
              </div>
```
por:
```tsx
              {personaExistente && (
                <div className="rounded-md border border-primary/40 bg-primary/5 px-3 py-2 text-sm">
                  Persona existente: {personaExistente.nombre} {personaExistente.apellido} · Legajo{" "}
                  {personaExistente.legajo}. Se le va a agregar el rol Alumno.
                </div>
              )}

              {!personaExistente && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nombre">Nombre</Label>
                    <Input id="nombre" value={form.nombre} onChange={setField("nombre")} disabled={submitting} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="apellido">Apellido</Label>
                    <Input id="apellido" value={form.apellido} onChange={setField("apellido")} disabled={submitting} />
                  </div>
                </div>
              )}
```

Reemplazar el bloque de teléfono/email (ocultar si `personaExistente`):
```tsx
                <div className="space-y-2">
                  <Label htmlFor="telefono">Teléfono</Label>
                  <Input id="telefono" value={form.telefono} onChange={setField("telefono")} disabled={submitting} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={form.email} onChange={setField("email")} disabled={submitting} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefonoSecundario">Teléfono Secundario (opcional)</Label>
                <Input
                  id="telefonoSecundario"
                  value={form.telefonoSecundario}
                  onChange={setField("telefonoSecundario")}
                  disabled={submitting}
                />
              </div>
            </>
          )}
```
por:
```tsx
                {!personaExistente && (
                  <Input id="telefono" value={form.telefono} onChange={setField("telefono")} disabled={submitting} />
                )}
              </div>

              {!personaExistente && (
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={form.email} onChange={setField("email")} disabled={submitting} />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="telefonoSecundario">Teléfono Secundario (opcional)</Label>
                <Input
                  id="telefonoSecundario"
                  value={form.telefonoSecundario}
                  onChange={setField("telefonoSecundario")}
                  disabled={submitting}
                />
              </div>
            </>
          )}
```

Nota: el `<Label htmlFor="telefono">Teléfono</Label>` que precede al `Input` de teléfono queda igual (fuera del `!personaExistente &&`), solo se condiciona el `Input`. Ajustar `validarCreacion()` para no exigir nombre/apellido/teléfono cuando hay `personaExistente`:

Reemplazar:
```typescript
  const validarCreacion = (): string | null => {
    if (!form.nombre.trim()) return "El nombre es obligatorio"
    if (!form.apellido.trim()) return "El apellido es obligatorio"
    if (!/^\d{7,8}$/.test(form.dni)) return "El DNI debe tener 7 u 8 dígitos"
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return "El email no es válido"
    if (!/^\d{6,15}$/.test(form.telefono)) return "El teléfono debe tener entre 6 y 15 dígitos"
    return null
  }
```
por:
```typescript
  const validarCreacion = (): string | null => {
    if (!/^\d{7,8}$/.test(form.dni)) return "El DNI debe tener 7 u 8 dígitos"
    if (personaExistente) return null
    if (!form.nombre.trim()) return "El nombre es obligatorio"
    if (!form.apellido.trim()) return "El apellido es obligatorio"
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return "El email no es válido"
    if (!/^\d{6,15}$/.test(form.telefono)) return "El teléfono debe tener entre 6 y 15 dígitos"
    return null
  }
```

Reemplazar el reset de `personaExistente` cuando se cierra/reabre el diálogo:
```typescript
  useEffect(() => {
    if (open) {
      setForm({
        ...emptyForm,
        telefonoSecundario: alumno?.telefonoSecundario ?? "",
      })
      setActivo(alumno?.activo ?? true)
      setError(null)
    }
  }, [open, alumno])
```
por:
```typescript
  useEffect(() => {
    if (open) {
      setForm({
        ...emptyForm,
        telefonoSecundario: alumno?.telefonoSecundario ?? "",
      })
      setActivo(alumno?.activo ?? true)
      setError(null)
      setPersonaExistente(null)
    }
  }, [open, alumno])
```

- [ ] **Step 3: `profesor-form-dialog.tsx` y `administrador-form-dialog.tsx` — mismo patrón**

Aplicar el mismo cambio (import de `buscarPersonaPorDni`/`PersonaResumen`, estado `personaExistente`, `handleDniBlur`, `onBlur` en el input DNI, banner condicional, ocultar nombre/apellido/email/teléfono cuando hay persona existente, relajar `validar()`/`validarCreacion()`, resetear `personaExistente` en el `useEffect` de apertura) adaptado a la estructura de cada componente:
- `profesor-form-dialog.tsx`: el mensaje del banner dice `"Se le va a agregar el rol Profesor."`; los campos a ocultar son nombre/apellido/dni-ya-no-aplica-porque-dni-sigue-visible/email/telefono (título y teléfono secundario siguen siempre visibles, son del rol nuevo).
- `administrador-form-dialog.tsx`: el mensaje del banner dice `"Se le va a agregar el rol {form.rol}."`; los campos a ocultar son nombre/apellido/email/teléfono (rol sigue siempre visible, es el dato del alta).

- [ ] **Step 4: Typecheck**

Run: `cd frontend && npx tsc --noEmit 2>&1 | grep -iE "alumno|profesor|administrador|personas"`
Expected: sin salida.

- [ ] **Step 5: Commit**

```bash
git add frontend/lib/services/personas.service.ts frontend/components/alumnos/alumno-form-dialog.tsx frontend/components/profesores/profesor-form-dialog.tsx frontend/components/administradores/administrador-form-dialog.tsx
git commit -m "feat(frontend): auto-deteccion de DNI existente en altas de Alumno/Profesor/Administrador"
```

---

### Task 15: Adopción de Flyway — dependencias, config, estandarización MySQL

**Files:**
- Modify: `backend/api/pom.xml`
- Modify: `backend/api/src/main/resources/application.yml`
- Modify: `backend/api/src/main/resources/application-local.yml`
- Modify: `backend/api/src/main/resources/application-prod.yml`
- Delete: `backend/api/src/main/resources/application-dev.yml`
- Modify: `backend/core/src/main/java/ar/edu/itec1misiones/config/DatabaseSeeder.java`

**Interfaces:** ninguna (config/infra).

- [ ] **Step 1: Agregar dependencias de Flyway, sacar H2**

En `backend/api/pom.xml`, reemplazar:
```xml
        <dependency>
            <groupId>com.h2database</groupId>
            <artifactId>h2</artifactId>
            <scope>runtime</scope>
        </dependency>

        <dependency>
            <groupId>com.mysql</groupId>
            <artifactId>mysql-connector-j</artifactId>
            <scope>runtime</scope>
        </dependency>
```
por:
```xml
        <dependency>
            <groupId>com.mysql</groupId>
            <artifactId>mysql-connector-j</artifactId>
            <scope>runtime</scope>
        </dependency>

        <dependency>
            <groupId>org.flywaydb</groupId>
            <artifactId>flyway-core</artifactId>
        </dependency>

        <dependency>
            <groupId>org.flywaydb</groupId>
            <artifactId>flyway-mysql</artifactId>
        </dependency>
```

- [ ] **Step 2: `application.yml` — perfil por defecto `local`**

Reemplazar:
```yaml
  profiles:
    active: ${SPRING_PROFILES_ACTIVE:dev}
```
por:
```yaml
  profiles:
    active: ${SPRING_PROFILES_ACTIVE:local}
```

- [ ] **Step 3: `application-local.yml` — `ddl-auto: validate`**

Reemplazar:
```yaml
  jpa:
    hibernate:
      ddl-auto: ${DB_DDL_AUTO:update}
    show-sql: true
    database-platform: org.hibernate.dialect.MySQL8Dialect
```
por:
```yaml
  jpa:
    hibernate:
      ddl-auto: validate
    show-sql: true
    database-platform: org.hibernate.dialect.MySQL8Dialect
  flyway:
    enabled: true
```

- [ ] **Step 4: `application-prod.yml` — `ddl-auto: validate` explícito**

Reemplazar:
```yaml
  jpa:
    hibernate:
      ddl-auto: validate
    show-sql: false
    database-platform: org.hibernate.dialect.MySQL8Dialect
```
por:
```yaml
  jpa:
    hibernate:
      ddl-auto: validate
    show-sql: false
    database-platform: org.hibernate.dialect.MySQL8Dialect
  flyway:
    enabled: true
```

- [ ] **Step 5: Borrar el perfil `dev`/H2**

```bash
rm backend/api/src/main/resources/application-dev.yml
```

- [ ] **Step 6: `DatabaseSeeder` corre en `local`, no en `dev`**

En `DatabaseSeeder.java`, reemplazar:
```java
@Slf4j
@Component
@Profile("dev")
@RequiredArgsConstructor
public class DatabaseSeeder implements CommandLineRunner {
```
por:
```java
@Slf4j
@Component
@Profile("local")
@RequiredArgsConstructor
public class DatabaseSeeder implements CommandLineRunner {
```

- [ ] **Step 7: Compilar**

Run: `cd backend && mvn -pl api -am compile -q`
Expected: `BUILD SUCCESS`

- [ ] **Step 8: Commit**

```bash
git add backend/api/pom.xml backend/api/src/main/resources/application.yml backend/api/src/main/resources/application-local.yml backend/api/src/main/resources/application-prod.yml backend/core/src/main/java/ar/edu/itec1misiones/config/DatabaseSeeder.java
git rm backend/api/src/main/resources/application-dev.yml
git commit -m "feat(backend): adoptar Flyway, estandarizar desarrollo en MySQL (se elimina H2/dev)"
```

---

### Task 16: `V1__init.sql` y verificación end-to-end

**Files:**
- Create: `backend/api/src/main/resources/db/migration/V1__init.sql`

**Interfaces:** ninguna.

- [ ] **Step 1: Dumpear el DDL real de Hibernate contra MySQL limpio**

Con Docker MySQL levantado y la base `backoffice_itec` VACÍA (si ya tiene datos de pruebas anteriores, dropearla y dejar que `createDatabaseIfNotExist` la recree):

```bash
docker compose down
docker volume rm web-2026-itec_mysql-data
docker compose up -d mysql-db
```

Run temporalmente con `ddl-auto: create` y dump a archivo (variable de entorno puntual, no se commitea):
```bash
cd backend
SPRING_DATASOURCE_URL="jdbc:mysql://localhost:3306/backoffice_itec?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC" \
SPRING_DATASOURCE_USERNAME=root SPRING_DATASOURCE_PASSWORD=root \
mvn -pl api -am spring-boot:run \
  -Dspring-boot.run.profiles=local \
  -Dspring-boot.run.arguments="--spring.jpa.hibernate.ddl-auto=create --spring.jpa.properties.jakarta.persistence.schema-generation.scripts.action=create --spring.jpa.properties.jakarta.persistence.schema-generation.scripts.create-target=/tmp/schema-dump.sql --spring.flyway.enabled=false"
```
Detener el proceso (Ctrl+C) apenas termine de arrancar (el archivo se escribe al inicio, antes de que la app quede escuchando).

- [ ] **Step 2: Copiar el dump a `V1__init.sql` y ajustar a mano**

```bash
cp /tmp/schema-dump.sql backend/api/src/main/resources/db/migration/V1__init.sql
```

Editar `V1__init.sql`:
- Confirmar que la tabla `usuarios` (o `users`, según el dump) tiene `UNIQUE KEY` en `legajo`, `dni`, `username`, `email` — y **NO** tiene `UNIQUE KEY` en `telefono`.
- Confirmar que la tabla de la entidad `Alumno` NO tiene columna `legajo` (debe haber quedado solo en `usuarios`).
- Agregar como primera línea un comentario:
```sql
-- Baseline generado por Hibernate schema-export (spring.jpa.properties.jakarta.persistence.schema-generation.scripts.action=create)
-- contra el modelo ya unificado (User.legajo, sin unique en telefono, Alumno sin legajo propio). Ver docs/superpowers/specs/2026-07-05-unificacion-actores-flyway-design.md
```

- [ ] **Step 3: Levantar todo con Flyway activo desde cero**

```bash
cd ..
docker compose down
docker volume rm web-2026-itec_mysql-data
docker compose build backend-app
docker compose up -d
```

- [ ] **Step 4: Verificar en el log que Flyway corrió `V1__init.sql`**

```bash
docker logs itec-backend 2>&1 | grep -i flyway
```
Expected: línea tipo `Successfully applied 1 migration to schema "backoffice_itec"`.

- [ ] **Step 5: Verificar que Hibernate valida sin error**

```bash
docker logs itec-backend 2>&1 | tail -50
```
Expected: sin excepciones de `SchemaManagementException`/`ddl-auto=validate` — la app arranca healthy.

- [ ] **Step 6: Re-correr la verificación funcional de las Tasks 11 y del selector de perfil**

Repetir los curls de Task 11 (crear Alumno, adjuntar rol Profesor, DNI duplicado con mismo rol → 409, `GET /api/personas/dni/{dni}`) contra este stack ya con Flyway, para confirmar que el baseline generado sostiene el comportamiento completo.

- [ ] **Step 7: Commit**

```bash
git add backend/api/src/main/resources/db/migration/V1__init.sql
git commit -m "feat(backend): V1__init.sql — baseline Flyway del schema unificado"
```

## Self-Review

**1. Cobertura del spec:**
- Legajo universal en `User`, generado una vez, inmutable → Tasks 1, 2, 4, 9, 10, 12, 13. ✓
- `Alumno.legajo` eliminado, `ProfesorResponse`/`UsuarioAdminResponse` ganan `legajo` → Tasks 1, 3, 4. ✓
- Endpoint de auto-detección por DNI → Tasks 7, 8. ✓
- Adjuntar rol a persona existente sin duplicar `User` (Alumno/Profesor/Admin) → Task 9, 10, 12, 13. ✓
- Frontend: auto-detect on-blur en los 3 formularios → Task 14. ✓
- Frontend: legajo de solo lectura visible → Task 5. ✓
- Flyway: dependencias, `ddl-auto: validate`, MySQL único, `DatabaseSeeder` en `local` → Task 15. ✓
- `V1__init.sql` generado por dump+diff → Task 16. ✓

**2. Placeholders:** ninguno — todos los pasos tienen código completo o comandos con output esperado.

**3. Consistencia de tipos:** `UserLookupPort.crearConCredencialesPorDni(String, String, String, String, String, String, Rol): User` mismo nombre/firma en Tasks 2, 9, 10, 12, 13. `UserLookupPort.buscarPorDni(String): Optional<PersonaResumenResponse>` mismo nombre/firma en Tasks 7, 8. `AlumnoRepository.findByUserLegajo(String)` mismo nombre en Tasks 3 y 4. `PersonaResumen`/`PersonaResumenResponse` mismos campos (`nombre, apellido, email, telefono, legajo, roles`) entre backend (Task 7) y frontend (Task 14).
