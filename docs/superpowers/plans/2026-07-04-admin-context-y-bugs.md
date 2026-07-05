# Bugfix Teléfonos + Selector de Perfil Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** (A) Unificar el teléfono secundario en `User` (permitiendo que Alumnos de una misma familia compartan teléfono principal), migrando `Profesor.telefonoContacto` a `User.telefonoSecundario` y agregando el campo (opcional) a Alumno. (B) Centralizar el "rol activo" en el contexto `useAuth` y agregar un selector de perfil en el Navbar para usuarios multi-rol.

**Architecture:** Backend: el campo de teléfono secundario pasa de vivir en `Profesor` a vivir en `User` (dato de la persona, no del rol); `UserLookupPort.crearConCredencialesPorDni` gana un parámetro nuevo y salta la validación de teléfono único cuando el rol es `ALUMNO`. Frontend: `useAuth` gana `roles: string[]` + `switchRole()`, reutilizado tanto por `/seleccionar-rol` (ya existente) como por un nuevo selector en el Navbar; `sidebar.tsx` no requiere cambios porque ya lee `user.role` del contexto.

**Tech Stack:** Spring Boot 3.2.5 / Java 17 (JPA/Hibernate `ddl-auto: update`, sin Flyway/Liquibase), Next.js/React (TypeScript, sin Zod/Yup — validación manual con regex).

## Global Constraints

- Proyecto en fase de desarrollo: no hace falta migrar datos existentes de `Profesor.telefonoContacto` — se puede recrear la base (`ddl-auto: update` crea columnas nuevas; las viejas quedan huérfanas y se ignoran).
- DNI regex `^\d{7,8}$`, teléfono regex `^\d{6,15}$` — mismos patrones que el resto del proyecto. Para el campo OPCIONAL `telefonoSecundario`, usar `^$|\d{6,15}$` (permite vacío o el patrón completo), ya que `@Pattern` de Jakarta Validation no valida `null` pero sí rechaza cadenas vacías contra un patrón que exige dígitos.
- Frontend NO usa Zod/Yup en ningún formulario — validación manual con regex, mismo estilo que `profesor-form-dialog.tsx`/`alumno-form-dialog.tsx` ya existentes.
- Sin tests de controller/repositorio en este repo; tampoco hay tests de `AlumnoServiceImpl`/`ProfesorServiceImpl` hoy (solo existen `AlumnoInscriptoServiceImplTest` y `UserAdminServiceImplTest`) — seguir esa convención, no agregar tests nuevos para estos dos services; verificación es manual (`mvn compile` + curl + rebuild docker).
- Sin tests de frontend en todo el repo — verificación es `tsc --noEmit`.
- El selector de rol activo redirige a `/dashboard` al cambiar (mismo comportamiento que `/seleccionar-rol` ya tiene).
- No agregar ningún guard de página por rol en el frontend — no existe hoy en ningún lado del sistema.

---

### Task 1: Entidades — `User` y `Profesor`

**Files:**
- Modify: `backend/commons/src/main/java/ar/edu/itec1misiones/model/User.java`
- Modify: `backend/core/src/main/java/ar/edu/itec1misiones/model/Profesor.java`

**Interfaces:**
- Produces: `User.getTelefonoSecundario()/setTelefonoSecundario(String)` — usado por Tasks 2, 3, 4.

- [ ] **Step 1: Quitar el `@UniqueConstraint` de `telefono` y agregar `telefonoSecundario` en `User`**

En `User.java`, reemplazar:
```java
@Table(name = "usuarios", uniqueConstraints = {
        @UniqueConstraint(columnNames = "username"),
        @UniqueConstraint(columnNames = "dni"),
        @UniqueConstraint(columnNames = "email"),
        @UniqueConstraint(columnNames = "telefono")
})
```
por:
```java
@Table(name = "usuarios", uniqueConstraints = {
        @UniqueConstraint(columnNames = "username"),
        @UniqueConstraint(columnNames = "dni"),
        @UniqueConstraint(columnNames = "email")
})
```

Y agregar el nuevo campo, inmediatamente después de `private String telefono;`:
```java
    private String telefonoSecundario;
```

- [ ] **Step 2: Quitar `telefonoContacto` de `Profesor`**

En `Profesor.java`, borrar la línea:
```java
    private String telefonoContacto;
```
El archivo queda:
```java
package ar.edu.itec1misiones.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Profesor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String titulo;
    private boolean activo = true;

    @OneToOne
    @JoinColumn(name = "user_id", referencedColumnName = "id")
    private User user;
}
```

- [ ] **Step 3: Compilar `commons` y `core`**

Run: `cd backend && mvn -pl commons,core -am compile -q`
Expected: `BUILD SUCCESS` (con errores esperados en `ProfesorServiceImpl`/`ProfesorRegistroDTO`/etc. que referencian `getTelefonoContacto()` — esos se corrigen en Task 3; si el compile falla ahí, es esperado y se resuelve en el próximo task, no hace falta arreglarlo en este paso).

Nota: como `Profesor.java` pierde un campo usado por otros archivos que todavía no se tocaron, el módulo `core` puede NO compilar hasta terminar Task 3. Si `mvn compile` falla citando `ProfesorServiceImpl.java` o `ProfesorRegistroDTO.java`/`ProfesorResponse.java`/`ProfesorUpdateRequest.java`, es el estado esperado de este paso intermedio — continuar a Task 2 y 3 sin revertir nada.

- [ ] **Step 4: Commit**

```bash
git add backend/commons/src/main/java/ar/edu/itec1misiones/model/User.java backend/core/src/main/java/ar/edu/itec1misiones/model/Profesor.java
git commit -m "feat(backend): mover telefono secundario de Profesor a User, quitar unique de telefono"
```

---

### Task 2: `UserLookupPort` — nuevo parámetro y excepción para Alumno

**Files:**
- Modify: `backend/core/src/main/java/ar/edu/itec1misiones/service/UserLookupPort.java`
- Modify: `backend/security/src/main/java/ar/edu/itec1misiones/security/service/UserLookupPortImpl.java`

**Interfaces:**
- Consumes: `User.setTelefonoSecundario(String)` (Task 1).
- Produces: `UserLookupPort.crearConCredencialesPorDni(String nombre, String apellido, String dni, String email, String telefono, String telefonoSecundario, Rol rol): User` — nueva firma, usada por Tasks 3 y 4.

- [ ] **Step 1: Actualizar la firma en la interfaz**

En `UserLookupPort.java`, reemplazar:
```java
    /**
     * Crea un Usuario con credenciales autogeneradas a partir del DNI
     * (username=DNI, password=DNI encriptada con BCrypt) y el rol indicado.
     * Usado para el alta de un solo paso de Alumnos/Profesores. Lanza
     * IllegalArgumentException si username/DNI/email/telefono ya estan en uso.
     */
    User crearConCredencialesPorDni(String nombre, String apellido, String dni, String email, String telefono, Rol rol);
```
por:
```java
    /**
     * Crea un Usuario con credenciales autogeneradas a partir del DNI
     * (username=DNI, password=DNI encriptada con BCrypt) y el rol indicado.
     * Usado para el alta de un solo paso de Alumnos/Profesores. Lanza
     * IllegalArgumentException si username/DNI/email ya estan en uso (o si
     * telefono ya esta en uso, salvo que el rol sea ALUMNO -- varios alumnos
     * de una misma familia pueden compartir telefono del hogar).
     */
    User crearConCredencialesPorDni(String nombre, String apellido, String dni, String email,
                                     String telefono, String telefonoSecundario, Rol rol);
```

- [ ] **Step 2: Actualizar la implementación**

En `UserLookupPortImpl.java`, reemplazar el método `crearConCredencialesPorDni` completo:
```java
    @Override
    public User crearConCredencialesPorDni(String nombre, String apellido, String dni, String email,
                                            String telefono, String telefonoSecundario, Rol rol) {
        List<String> errores = new ArrayList<>();
        if (userRepository.existsByUsername(dni)) {
            errores.add("Ya existe un usuario con username '" + dni + "'");
        }
        if (userRepository.existsByDni(dni)) {
            errores.add("El DNI '" + dni + "' ya está en uso");
        }
        if (userRepository.existsByEmail(email)) {
            errores.add("El email '" + email + "' ya está en uso");
        }
        // Alumnos de una misma familia pueden compartir telefono del hogar;
        // para el resto de los roles el telefono sigue siendo personal/unico.
        if (rol != Rol.ALUMNO && userRepository.existsByTelefono(telefono)) {
            errores.add("El teléfono '" + telefono + "' ya está en uso");
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
        // Alumnos/Profesores no tienen UI propia todavia: la cuenta se crea
        // deshabilitada para que no puedan loguearse (ver Reglas_de_Negocio.md).
        user.setEnabled(false);

        return userRepository.save(user);
    }
```

- [ ] **Step 3: Compilar módulo `security`**

Run: `cd backend && mvn -pl security -am compile -q`
Expected: `BUILD SUCCESS`

- [ ] **Step 4: Commit**

```bash
git add backend/core/src/main/java/ar/edu/itec1misiones/service/UserLookupPort.java backend/security/src/main/java/ar/edu/itec1misiones/security/service/UserLookupPortImpl.java
git commit -m "feat(backend): telefonoSecundario y telefono no-unico para ALUMNO en UserLookupPort"
```

---

### Task 3: Profesor — DTOs y Service migrados a `telefonoSecundario`

**Files:**
- Modify: `backend/core/src/main/java/ar/edu/itec1misiones/dto/request/ProfesorRegistroDTO.java`
- Modify: `backend/core/src/main/java/ar/edu/itec1misiones/dto/request/ProfesorUpdateRequest.java`
- Modify: `backend/core/src/main/java/ar/edu/itec1misiones/dto/response/ProfesorResponse.java`
- Modify: `backend/core/src/main/java/ar/edu/itec1misiones/service/impl/ProfesorServiceImpl.java`

**Interfaces:**
- Consumes: `UserLookupPort.crearConCredencialesPorDni(..., String telefonoSecundario, Rol rol)` (Task 2), `User.getTelefonoSecundario()/setTelefonoSecundario(String)` (Task 1).
- Produces: `ProfesorResponse.telefonoSecundario` — consumido por el frontend en Task 5.

- [ ] **Step 1: Renombrar el campo en `ProfesorRegistroDTO`**

Reemplazar:
```java
    @NotBlank(message = "El teléfono de contacto es obligatorio")
    private String telefonoContacto;
```
por:
```java
    @NotBlank(message = "El teléfono secundario es obligatorio")
    private String telefonoSecundario;
```

- [ ] **Step 2: Renombrar el campo en `ProfesorUpdateRequest`**

Archivo completo queda:
```java
package ar.edu.itec1misiones.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ProfesorUpdateRequest {

    @NotBlank(message = "El título es obligatorio")
    private String titulo;

    @NotBlank(message = "El teléfono secundario es obligatorio")
    private String telefonoSecundario;

    private boolean activo;
}
```

- [ ] **Step 3: Renombrar el campo en `ProfesorResponse`**

Archivo completo queda:
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
    private String nombre;
    private String apellido;
    private String dni;
    private String email;
    private String telefono;
}
```

- [ ] **Step 4: Actualizar `ProfesorServiceImpl`**

Reemplazar el método `crearConUsuario`:
```java
    @Override
    public ProfesorResponse crearConUsuario(ProfesorRegistroDTO dto) {
        // Si esto falla (DNI/email duplicado), la transaccion completa
        // se revierte -- no queda un Usuario huerfano sin Profesor asociado.
        User user = userLookupPort.crearConCredencialesPorDni(
                dto.getNombre(), dto.getApellido(), dto.getDni(), dto.getEmail(),
                dto.getTelefono(), dto.getTelefonoSecundario(), Rol.PROFESOR);

        Profesor profesor = new Profesor();
        profesor.setUser(user);
        profesor.setTitulo(dto.getTitulo());
        profesor.setActivo(true);

        return toResponse(profesorRepository.save(profesor));
    }
```

Reemplazar el método `actualizar`:
```java
    @Override
    public ProfesorResponse actualizar(Long id, ProfesorUpdateRequest request) {
        Profesor profesor = profesorRepository.findById(id)
                .orElseThrow(() -> new ProfesorNotFoundException(id));

        profesor.setTitulo(request.getTitulo());
        profesor.getUser().setTelefonoSecundario(request.getTelefonoSecundario());
        profesor.setActivo(request.isActivo());

        return toResponse(profesorRepository.save(profesor));
    }
```

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
                .nombre(user.getNombre())
                .apellido(user.getApellido())
                .dni(user.getDni())
                .email(user.getEmail())
                .telefono(user.getTelefono())
                .build();
    }
```

- [ ] **Step 5: Compilar módulo `core`**

Run: `cd backend && mvn -pl core -am compile -q`
Expected: `BUILD SUCCESS`

- [ ] **Step 6: Commit**

```bash
git add backend/core/src/main/java/ar/edu/itec1misiones/dto/request/ProfesorRegistroDTO.java backend/core/src/main/java/ar/edu/itec1misiones/dto/request/ProfesorUpdateRequest.java backend/core/src/main/java/ar/edu/itec1misiones/dto/response/ProfesorResponse.java backend/core/src/main/java/ar/edu/itec1misiones/service/impl/ProfesorServiceImpl.java
git commit -m "refactor(backend): migrar Profesor.telefonoContacto a User.telefonoSecundario"
```

---

### Task 4: Alumno — `telefonoSecundario` opcional en DTOs y Service

**Files:**
- Modify: `backend/core/src/main/java/ar/edu/itec1misiones/dto/request/AlumnoRegistroDTO.java`
- Modify: `backend/core/src/main/java/ar/edu/itec1misiones/dto/request/AlumnoUpdateRequest.java`
- Modify: `backend/core/src/main/java/ar/edu/itec1misiones/dto/response/AlumnoResponse.java`
- Modify: `backend/core/src/main/java/ar/edu/itec1misiones/service/impl/AlumnoServiceImpl.java`

**Interfaces:**
- Consumes: `UserLookupPort.crearConCredencialesPorDni(..., String telefonoSecundario, Rol rol)` (Task 2), `User.getTelefonoSecundario()/setTelefonoSecundario(String)` (Task 1).
- Produces: `AlumnoResponse.telefonoSecundario` — consumido por el frontend en Task 6.

- [ ] **Step 1: Agregar `telefonoSecundario` opcional a `AlumnoRegistroDTO`**

Archivo completo queda:
```java
package ar.edu.itec1misiones.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

/**
 * Alta de un solo paso para Alumnos (uso exclusivamente administrativo).
 * El servicio crea el Usuario asociado automaticamente: username=DNI,
 * password=DNI (encriptada), rol=ALUMNO. Ver docs/Reglas_de_Negocio.md.
 */
@Data
public class AlumnoRegistroDTO {

    @NotBlank(message = "El nombre es obligatorio")
    private String nombre;

    @NotBlank(message = "El apellido es obligatorio")
    private String apellido;

    @NotBlank(message = "El DNI es obligatorio")
    @Pattern(regexp = "\\d{7,8}", message = "El DNI debe tener 7 u 8 dígitos numéricos")
    private String dni;

    @NotBlank(message = "El email es obligatorio")
    @Email(message = "El email no es válido")
    private String email;

    @NotBlank(message = "El teléfono es obligatorio")
    @Pattern(regexp = "\\d{6,15}", message = "El teléfono debe contener entre 6 y 15 números")
    private String telefono;

    @Pattern(regexp = "^$|\\d{6,15}", message = "El teléfono secundario debe contener entre 6 y 15 números")
    private String telefonoSecundario;
}
```

- [ ] **Step 2: Agregar `telefonoSecundario` opcional a `AlumnoUpdateRequest`**

Archivo completo queda:
```java
package ar.edu.itec1misiones.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class AlumnoUpdateRequest {

    @NotBlank(message = "El legajo es obligatorio")
    private String legajo;

    private boolean activo;

    @Pattern(regexp = "^$|\\d{6,15}", message = "El teléfono secundario debe contener entre 6 y 15 números")
    private String telefonoSecundario;
}
```

- [ ] **Step 3: Agregar `telefonoSecundario` a `AlumnoResponse`**

Archivo completo queda:
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
public class AlumnoResponse {
    private Long id;
    private String legajo;
    private boolean activo;
    private Long userId;
    private String username;
    private String nombre;
    private String apellido;
    private String dni;
    private String email;
    private String telefono;
    private String telefonoSecundario;
}
```

- [ ] **Step 4: Actualizar `AlumnoServiceImpl`**

Reemplazar el método `crearConUsuario`:
```java
    @Override
    public AlumnoResponse crearConUsuario(AlumnoRegistroDTO dto) {
        // Legajo autogenerado AAAA-DNI (año de alta + DNI); no se pide manualmente.
        String legajo = LocalDate.now().getYear() + "-" + dto.getDni();
        if (alumnoRepository.existsByLegajo(legajo)) {
            throw new IllegalArgumentException(
                    "El legajo '" + legajo + "' ya está en uso");
        }

        // Si esto falla (DNI/email duplicado), la transaccion completa
        // se revierte -- no queda un Usuario huerfano sin Alumno asociado.
        User user = userLookupPort.crearConCredencialesPorDni(
                dto.getNombre(), dto.getApellido(), dto.getDni(), dto.getEmail(),
                dto.getTelefono(), dto.getTelefonoSecundario(), Rol.ALUMNO);

        Alumno alumno = new Alumno();
        alumno.setUser(user);
        alumno.setLegajo(legajo);
        alumno.setActivo(true);

        return toResponse(alumnoRepository.save(alumno));
    }
```

Reemplazar el método `actualizar`:
```java
    @Override
    public AlumnoResponse actualizar(Long id, AlumnoUpdateRequest request) {
        Alumno alumno = alumnoRepository.findById(id)
                .orElseThrow(() -> new AlumnoNotFoundException(id));

        if (alumnoRepository.existsByLegajoAndIdNot(request.getLegajo(), id)) {
            throw new IllegalArgumentException(
                    "El legajo '" + request.getLegajo() + "' ya está en uso");
        }

        alumno.setLegajo(request.getLegajo());
        alumno.setActivo(request.isActivo());
        alumno.getUser().setTelefonoSecundario(request.getTelefonoSecundario());

        return toResponse(alumnoRepository.save(alumno));
    }
```

Reemplazar el método `toResponse`:
```java
    private AlumnoResponse toResponse(Alumno alumno) {
        User user = alumno.getUser();
        return AlumnoResponse.builder()
                .id(alumno.getId())
                .legajo(alumno.getLegajo())
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

- [ ] **Step 5: Compilar todo el backend**

Run: `cd backend && mvn -pl api -am compile -q`
Expected: `BUILD SUCCESS`

- [ ] **Step 6: Commit**

```bash
git add backend/core/src/main/java/ar/edu/itec1misiones/dto/request/AlumnoRegistroDTO.java backend/core/src/main/java/ar/edu/itec1misiones/dto/request/AlumnoUpdateRequest.java backend/core/src/main/java/ar/edu/itec1misiones/dto/response/AlumnoResponse.java backend/core/src/main/java/ar/edu/itec1misiones/service/impl/AlumnoServiceImpl.java
git commit -m "feat(backend): telefonoSecundario opcional para Alumno (crear y editar)"
```

---

### Task 5: Frontend — Profesor apunta a `telefonoSecundario`

**Files:**
- Modify: `frontend/lib/services/profesores.service.ts`
- Modify: `frontend/components/profesores/profesor-form-dialog.tsx`

**Interfaces:**
- Consumes: `ProfesorResponse.telefonoSecundario` (Task 3, vía `/api/core/profesores`).

- [ ] **Step 1: Renombrar el campo en `profesores.service.ts`**

Reemplazar el archivo completo:
```typescript
import apiClient from "@/lib/api-client"

// Coincide con ProfesorResponse del Core. nombre/apellido/dni/email/telefono
// vienen denormalizados desde el Usuario asociado -- no son editables aca.
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

// POST /api/core/profesores es un alta de un solo paso: el Core crea el
// Usuario (username=DNI, password=DNI encriptada, rol=PROFESOR, enabled=false)
// y el Profesor en la misma transaccion (ver docs/Reglas_de_Negocio.md).
export interface CrearProfesorInput {
  nombre: string
  apellido: string
  dni: string
  email: string
  telefono: string
  titulo: string
  telefonoSecundario: string
}

// ProfesorUpdateRequest del Core: titulo, telefonoSecundario y activo son editables.
export interface ActualizarProfesorInput {
  titulo: string
  telefonoSecundario: string
  activo: boolean
}

const BASE_PATH = "/api/core/profesores"

export async function listarProfesores(): Promise<Profesor[]> {
  const response = await apiClient.get<Profesor[]>(BASE_PATH)
  return response.data
}

export async function crearProfesor(input: CrearProfesorInput): Promise<Profesor> {
  const response = await apiClient.post<Profesor[]>(BASE_PATH, input)
  return response.data[0]
}

export async function actualizarProfesor(id: number, input: ActualizarProfesorInput): Promise<Profesor> {
  const response = await apiClient.put<Profesor[]>(`${BASE_PATH}/${id}`, input)
  return response.data[0]
}

export async function eliminarProfesor(id: number): Promise<void> {
  await apiClient.delete<string>(`${BASE_PATH}/${id}`)
}
```

- [ ] **Step 2: Renombrar el campo en `profesor-form-dialog.tsx`**

En `frontend/components/profesores/profesor-form-dialog.tsx`, hacer estos 5 reemplazos puntuales (el label visible "Teléfono Secundario" ya está bien desde antes, no cambia):

Reemplazar:
```typescript
  telefono: "",
  titulo: "",
  telefonoContacto: "",
}
```
por:
```typescript
  telefono: "",
  titulo: "",
  telefonoSecundario: "",
}
```

Reemplazar:
```typescript
        titulo: profesor?.titulo ?? "",
        telefonoContacto: profesor?.telefonoContacto ?? "",
```
por:
```typescript
        titulo: profesor?.titulo ?? "",
        telefonoSecundario: profesor?.telefonoSecundario ?? "",
```

Reemplazar:
```typescript
    if (!form.telefonoContacto.trim()) return "El teléfono de contacto es obligatorio"
```
por:
```typescript
    if (!form.telefonoSecundario.trim()) return "El teléfono secundario es obligatorio"
```

Reemplazar:
```typescript
    if (isEditing) {
      if (!form.titulo.trim() || !form.telefonoContacto.trim()) {
        setError("Título y teléfono de contacto son obligatorios")
        return
      }
    } else {
```
por:
```typescript
    if (isEditing) {
      if (!form.titulo.trim() || !form.telefonoSecundario.trim()) {
        setError("Título y teléfono secundario son obligatorios")
        return
      }
    } else {
```

Reemplazar:
```typescript
        const actualizado = await actualizarProfesor(profesor!.id, {
          titulo: form.titulo.trim(),
          telefonoContacto: form.telefonoContacto.trim(),
          activo,
        })
```
por:
```typescript
        const actualizado = await actualizarProfesor(profesor!.id, {
          titulo: form.titulo.trim(),
          telefonoSecundario: form.telefonoSecundario.trim(),
          activo,
        })
```

Y en el JSX, reemplazar:
```tsx
              <Label htmlFor="telefonoContacto">Teléfono Secundario (opcional)</Label>
              <Input
                id="telefonoContacto"
                value={form.telefonoContacto}
                onChange={setField("telefonoContacto")}
                disabled={submitting}
              />
```
por:
```tsx
              <Label htmlFor="telefonoSecundario">Teléfono Secundario</Label>
              <Input
                id="telefonoSecundario"
                value={form.telefonoSecundario}
                onChange={setField("telefonoSecundario")}
                disabled={submitting}
              />
```

Nota: el label pierde el "(opcional)" porque para Profesor este campo sigue siendo obligatorio (a diferencia de Alumno, ver Task 6) — así queda consistente con la validación real.

- [ ] **Step 3: Typecheck**

Run: `cd frontend && npx tsc --noEmit 2>&1 | grep -E "profesor"`
Expected: sin salida.

- [ ] **Step 4: Commit**

```bash
git add frontend/lib/services/profesores.service.ts frontend/components/profesores/profesor-form-dialog.tsx
git commit -m "refactor(frontend): profesores apuntan a telefonoSecundario"
```

---

### Task 6: Frontend — Alumno gana `telefonoSecundario` opcional

**Files:**
- Modify: `frontend/lib/services/alumnos.service.ts`
- Modify: `frontend/components/alumnos/alumno-form-dialog.tsx`

**Interfaces:**
- Consumes: `AlumnoResponse.telefonoSecundario` (Task 4, vía `/api/core/alumnos`).

- [ ] **Step 1: Agregar el campo en `alumnos.service.ts`**

Reemplazar el archivo completo:
```typescript
import apiClient from "@/lib/api-client"

// Coincide con AlumnoResponse del Core. nombre/apellido/dni/email/telefono
// vienen denormalizados desde el Usuario asociado -- no son editables aca.
// telefonoSecundario si es editable (dato opcional de contacto).
export interface Alumno {
  id: number
  legajo: string
  activo: boolean
  userId: number
  username: string
  nombre: string
  apellido: string
  dni: string
  email: string
  telefono: string
  telefonoSecundario: string
}

// POST /api/core/alumnos ahora es un alta de un solo paso: el Core crea el
// Usuario (username=DNI, password=DNI encriptada, rol=ALUMNO) y el Alumno en
// la misma transaccion (ver docs/Reglas_de_Negocio.md y AlumnoRegistroDTO).
// El legajo ya no se pide: el Core lo autogenera como AAAA-DNI.
export interface CrearAlumnoInput {
  nombre: string
  apellido: string
  dni: string
  email: string
  telefono: string
  telefonoSecundario?: string
}

// AlumnoUpdateRequest del Core: legajo, estado activo y telefonoSecundario son editables.
export interface ActualizarAlumnoInput {
  legajo: string
  activo: boolean
  telefonoSecundario?: string
}

const BASE_PATH = "/api/core/alumnos"

export async function listarAlumnos(): Promise<Alumno[]> {
  const response = await apiClient.get<Alumno[]>(BASE_PATH)
  return response.data
}

export async function crearAlumno(input: CrearAlumnoInput): Promise<Alumno> {
  const response = await apiClient.post<Alumno[]>(BASE_PATH, input)
  return response.data[0]
}

export async function actualizarAlumno(id: number, input: ActualizarAlumnoInput): Promise<Alumno> {
  const response = await apiClient.put<Alumno[]>(`${BASE_PATH}/${id}`, input)
  return response.data[0]
}

export async function eliminarAlumno(id: number): Promise<void> {
  await apiClient.delete<string>(`${BASE_PATH}/${id}`)
}
```

- [ ] **Step 2: Agregar el campo al formulario, en creación y edición**

En `frontend/components/alumnos/alumno-form-dialog.tsx`, reemplazar:
```typescript
const emptyForm = {
  nombre: "",
  apellido: "",
  dni: "",
  email: "",
  telefono: "",
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
  legajo: "",
}
```

Reemplazar:
```typescript
      setForm({ ...emptyForm, legajo: alumno?.legajo ?? "" })
```
por:
```typescript
      setForm({
        ...emptyForm,
        legajo: alumno?.legajo ?? "",
        telefonoSecundario: alumno?.telefonoSecundario ?? "",
      })
```

Reemplazar:
```typescript
      if (isEditing) {
        const actualizado = await actualizarAlumno(alumno!.id, { legajo: form.legajo.trim(), activo })
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

En el JSX, agregar el campo dentro del bloque `{!isEditing && (...)}` (creación), después del bloque de "Email":
```tsx
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

Y agregar el mismo campo en el bloque de edición, después del bloque `{isEditing && (<div>legajo</div>)}` y antes del bloque de "Estado":
```tsx
          {isEditing && (
            <div className="space-y-2">
              <Label htmlFor="telefonoSecundario">Teléfono Secundario (opcional)</Label>
              <Input
                id="telefonoSecundario"
                value={form.telefonoSecundario}
                onChange={setField("telefonoSecundario")}
                disabled={submitting}
              />
            </div>
          )}

          {isEditing && (
            <div className="space-y-2">
              <Label>Estado</Label>
```
(reemplaza el `{isEditing && (` que hoy precede directamente al bloque de "Estado").

- [ ] **Step 3: Typecheck**

Run: `cd frontend && npx tsc --noEmit 2>&1 | grep -E "alumno"`
Expected: sin salida.

- [ ] **Step 4: Commit**

```bash
git add frontend/lib/services/alumnos.service.ts frontend/components/alumnos/alumno-form-dialog.tsx
git commit -m "feat(frontend): telefonoSecundario opcional en alta y edicion de alumnos"
```

---

### Task 7: `useAuth` — `roles` y `switchRole`

**Files:**
- Modify: `frontend/hooks/use-auth.tsx`

**Interfaces:**
- Produces: `AuthUser.roles?: string[]`, `AuthContextType.switchRole(rol: string): void` — consumidos por Tasks 8 y 9.

- [ ] **Step 1: Agregar `roles` a `AuthUser` y `switchRole` al contexto**

Reemplazar:
```typescript
export type AuthUser = {
  username: string
  role: string
  nombres?: string
  apellido?: string
  dni?: string
  email?: string
  telefono?: string
}

type AuthContextType = {
  token: string | null
  user: AuthUser | null
  login: (username: string, password: string) => Promise<void>
  logout: () => void
  setUser: (user: AuthUser | null) => void
}
```
por:
```typescript
export type AuthUser = {
  username: string
  role: string
  roles?: string[]
  nombres?: string
  apellido?: string
  dni?: string
  email?: string
  telefono?: string
}

type AuthContextType = {
  token: string | null
  user: AuthUser | null
  login: (username: string, password: string) => Promise<void>
  logout: () => void
  setUser: (user: AuthUser | null) => void
  switchRole: (rol: string) => void
}
```

Reemplazar el bloque `loadUserFromStorage` dentro de `useEffect`:
```typescript
    const loadUserFromStorage = () => {
      const storedToken = localStorage.getItem("token")
      const storedRole = localStorage.getItem("user-role")
      const storedUsername = localStorage.getItem("username")

      if (storedToken && storedRole && storedUsername) {
        setUser({
          username: storedUsername,
          role: storedRole,
          nombres: localStorage.getItem("nombres") || undefined,
          apellido: localStorage.getItem("apellido") || undefined,
          dni: localStorage.getItem("dni") || undefined,
          email: localStorage.getItem("email") || undefined,
          telefono: localStorage.getItem("telefono") || undefined,
        })
      } else {
        setUser(null)
      }
    }
```
por:
```typescript
    const loadUserFromStorage = () => {
      const storedToken = localStorage.getItem("token")
      const storedRole = localStorage.getItem("user-role")
      const storedUsername = localStorage.getItem("username")

      if (storedToken && storedRole && storedUsername) {
        let storedRoles: string[] | undefined
        try {
          const parsed = JSON.parse(localStorage.getItem("roles") || "[]")
          storedRoles = Array.isArray(parsed) ? parsed : undefined
        } catch {
          storedRoles = undefined
        }

        setUser({
          username: storedUsername,
          role: storedRole,
          roles: storedRoles,
          nombres: localStorage.getItem("nombres") || undefined,
          apellido: localStorage.getItem("apellido") || undefined,
          dni: localStorage.getItem("dni") || undefined,
          email: localStorage.getItem("email") || undefined,
          telefono: localStorage.getItem("telefono") || undefined,
        })
      } else {
        setUser(null)
      }
    }
```

Agregar la función `switchRole`, después de la definición de `logout` (antes del `return`):
```typescript
  // Cambia el rol activo de un usuario multi-rol sin volver a loguearse: el
  // JWT ya trae todos los roles (localStorage "roles"), esto solo cambia
  // cual es el activo (localStorage "user-role" + contexto).
  const switchRole = useCallback(
    (rol: string) => {
      localStorage.setItem("user-role", rol)
      setUser((prev) => (prev ? { ...prev, role: rol } : prev))
    },
    []
  )
```

Y agregar `switchRole` al value del provider:
```typescript
  return (
    <AuthContext.Provider value={{ token, user, login, logout, setUser, switchRole }}>
      {children}
    </AuthContext.Provider>
  )
```

- [ ] **Step 2: Typecheck**

Run: `cd frontend && npx tsc --noEmit 2>&1 | grep -E "use-auth"`
Expected: sin salida.

- [ ] **Step 3: Commit**

```bash
git add frontend/hooks/use-auth.tsx
git commit -m "feat(frontend): agregar roles y switchRole al contexto useAuth"
```

---

### Task 8: `/seleccionar-rol` usa `switchRole`

**Files:**
- Modify: `frontend/app/seleccionar-rol/page.tsx`

**Interfaces:**
- Consumes: `useAuth().switchRole(rol: string)` (Task 7).

- [ ] **Step 1: Simplificar `handleRoleSelect`**

Reemplazar:
```typescript
  const { setUser } = useAuth()
```
por:
```typescript
  const { switchRole } = useAuth()
```

Reemplazar:
```typescript
  const handleRoleSelect = (rol: string) => {
    // Guardar rol seleccionado
    localStorage.setItem("user-role", rol)
    localStorage.removeItem("pending-roles")

    // Actualizar contexto
    setUser({
      username: localStorage.getItem("username") || "",
      role: rol,
      nombres: localStorage.getItem("nombres") || undefined,
      apellido: localStorage.getItem("apellido") || undefined,
      dni: localStorage.getItem("dni") || undefined,
      email: localStorage.getItem("email") || undefined,
      telefono: localStorage.getItem("telefono") || undefined,
    })

    router.push("/dashboard")
  }
```
por:
```typescript
  const handleRoleSelect = (rol: string) => {
    localStorage.removeItem("pending-roles")
    switchRole(rol)
    router.push("/dashboard")
  }
```

- [ ] **Step 2: Typecheck**

Run: `cd frontend && npx tsc --noEmit 2>&1 | grep -E "seleccionar-rol"`
Expected: sin salida.

- [ ] **Step 3: Commit**

```bash
git add frontend/app/seleccionar-rol/page.tsx
git commit -m "refactor(frontend): seleccionar-rol usa switchRole del contexto"
```

---

### Task 9: Navbar — selector de perfil (Context Switcher)

**Files:**
- Modify: `frontend/components/layout/header.tsx`

**Interfaces:**
- Consumes: `useAuth().user` (`role`, `roles`, `nombres`, `apellido`), `useAuth().switchRole(rol: string)`, `useAuth().logout()` (Task 7; `logout` ya existía en el contexto, se usa acá en vez del `handleLogout` local con `localStorage.clear()` manual).

- [ ] **Step 1: Reemplazar `header.tsx` completo**

```tsx
"use client"

import { useRouter, usePathname } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LogOut, User, ChevronRight, Repeat } from "lucide-react"
import { navigation } from "@/components/layout/sidebar"
import { useAuth } from "@/hooks/use-auth"

function getSectionLabel(pathname: string) {
  const exact = navigation.find((item) => item.href === pathname)
  if (exact) return exact.name

  const parent = navigation
    .filter((item) => item.href !== "/dashboard" && pathname.startsWith(item.href))
    .sort((a, b) => b.href.length - a.href.length)[0]

  return parent?.name ?? "Inicio"
}

function getInitials(nombres: string, apellido: string) {
  const a = nombres?.trim()?.[0] ?? ""
  const b = apellido?.trim()?.[0] ?? ""
  return (a + b).toUpperCase() || "US"
}

export default function Header() {
  const router = useRouter()
  const pathname = usePathname()
  const { user, switchRole, logout } = useAuth()

  const handleLogout = () => {
    logout()
  }

  const handleSwitchRole = (rol: string) => {
    switchRole(rol)
    router.push("/dashboard")
  }

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "default"
      case "ADMINISTRATIVO":
        return "secondary"
      case "ALUMNO":
        return "outline"
      case "PROFESOR":
        return "secondary"
      default:
        return "secondary"
    }
  }

  const sectionLabel = getSectionLabel(pathname)

  if (!user) {
    return <header className="h-[65px] border-b border-border bg-card/60 backdrop-blur-xl" />
  }

  const otrosRoles = (user.roles ?? []).filter((rol) => rol !== user.role)

  return (
    <header className="border-b border-border bg-card/60 px-6 py-3 backdrop-blur-xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <span>Backoffice</span>
          <ChevronRight className="size-3.5" />
          <span className="font-medium text-foreground">{sectionLabel}</span>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant={getRoleBadgeVariant(user.role)} className="hidden sm:inline-flex">
            {user.role}
          </Badge>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 rounded-full p-1 pr-3 transition-colors hover:bg-accent">
                <Avatar className="size-8">
                  <AvatarFallback className="bg-primary text-xs font-semibold text-primary-foreground">
                    {getInitials(user.nombres ?? "", user.apellido ?? "")}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden text-sm font-medium md:inline">
                  {user.nombres} {user.apellido}
                </span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push("/perfil")}>
                <User className="mr-2 size-4" />
                Perfil
              </DropdownMenuItem>
              {otrosRoles.length > 0 && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>Cambiar rol</DropdownMenuLabel>
                  {otrosRoles.map((rol) => (
                    <DropdownMenuItem key={rol} onClick={() => handleSwitchRole(rol)}>
                      <Repeat className="mr-2 size-4" />
                      Modo: {rol}
                    </DropdownMenuItem>
                  ))}
                </>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 size-4" />
                Cerrar Sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
```

Nota: se quita el `mounted`/placeholder-hasta-montar que tenía el componente original (evitaba un mismatch de hidratación al leer `localStorage` directo en `useEffect`). Ya no hace falta: `useAuth()` maneja su propia carga inicial desde `localStorage` dentro de su propio `useEffect` (ver `use-auth.tsx`), y mientras `user` es `null` (carga inicial o sin sesión) este componente ya devuelve el placeholder vacío del `if (!user)`.

- [ ] **Step 2: Typecheck**

Run: `cd frontend && npx tsc --noEmit 2>&1 | grep -E "header"`
Expected: sin salida.

- [ ] **Step 3: Commit**

```bash
git add frontend/components/layout/header.tsx
git commit -m "feat(frontend): selector de perfil en el Navbar para usuarios multi-rol"
```

---

### Task 10: Verificación end-to-end

**Files:** ninguno (solo verificación manual).

- [ ] **Step 1: Rebuild y levantar Docker**

```bash
docker compose build backend-app frontend-app
docker compose up -d
docker compose ps --format "table {{.Name}}\t{{.Status}}"
```
Expected: 6 contenedores `Up`/`healthy`.

- [ ] **Step 2: Verificar teléfono compartido entre Alumnos (curl)**

```bash
TOKEN=$(curl -s -X POST http://localhost:8080/api/core/auth/login -H "Content-Type: application/json" -d '{"username":"admin","password":"admin123"}' | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

# Crear primer alumno con telefono X
curl -s -X POST http://localhost:8080/api/core/alumnos -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"nombre":"Hermano1","apellido":"Test","dni":"40111222","email":"hermano1@test.com","telefono":"3760009999"}'
# Expected: 201, alumno creado

# Crear segundo alumno con el MISMO telefono (debe funcionar, ya no es unico para ALUMNO)
curl -s -X POST http://localhost:8080/api/core/alumnos -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"nombre":"Hermano2","apellido":"Test","dni":"40111223","email":"hermano2@test.com","telefono":"3760009999","telefonoSecundario":"3760008888"}'
# Expected: 201, alumno creado SIN error de telefono duplicado
```

- [ ] **Step 3: Verificar que Profesor sigue rechazando teléfono duplicado**

```bash
curl -s -X POST http://localhost:8080/api/core/profesores -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"nombre":"Prof1","apellido":"Test","dni":"40222333","email":"prof1@test.com","telefono":"3760007777","titulo":"Ing.","telefonoSecundario":"3760006666"}'
# Expected: 201

curl -s -w "\nSTATUS:%{http_code}\n" -X POST http://localhost:8080/api/core/profesores -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"nombre":"Prof2","apellido":"Test","dni":"40222334","email":"prof2@test.com","telefono":"3760007777","titulo":"Ing.","telefonoSecundario":"3760006666"}'
# Expected: 400 o 409 -- rechaza telefono duplicado (PROFESOR sigue siendo unico)
```

- [ ] **Step 4: Verificación manual en navegador — selector de perfil**

1. Si no existe un usuario de prueba multi-rol, crear uno vía `/dashboard/administradores` o `/auth/register` con roles `["ADMIN","PROFESOR"]` (o usar el admin seed, que ya tiene `ADMIN+PROFESOR`).
2. Loguearse con ese usuario. Confirmar que el dropdown del avatar (arriba a la derecha) muestra una sección "Cambiar rol" con la opción del otro rol.
3. Hacer clic en "Modo: PROFESOR" (o el que corresponda). Confirmar: redirige a `/dashboard`, el badge de rol cambia, y el Sidebar muestra ahora los ítems del rol PROFESOR (Asistencias/Calificaciones) en vez de los de ADMIN.
4. Loguearse con un usuario de un solo rol (ej. un Alumno). Confirmar que la sección "Cambiar rol" NO aparece en el dropdown.

- [ ] **Step 5: Verificación manual en navegador — teléfono secundario de Alumno**

1. Ir a `/dashboard/alumnos`, crear un alumno nuevo con "Teléfono Secundario" vacío. Confirmar que se crea sin error (campo opcional).
2. Editar ese alumno, completar "Teléfono Secundario", guardar. Confirmar que persiste (recargar la página o volver a abrir el diálogo de edición y confirmar que el valor sigue ahí).

## Self-Review

**1. Cobertura del spec:**
- Quitar unique constraint de `User.telefono` → Task 1. ✓
- `telefonoSecundario` en `User`, migrado desde `Profesor.telefonoContacto` → Tasks 1, 3. ✓
- `existsByTelefono` saltado para `ALUMNO` → Task 2. ✓
- `telefonoSecundario` opcional y editable en Alumno (alta y edición) → Task 4 (backend), Task 6 (frontend). ✓
- `AuthUser.roles` + `switchRole` centralizados → Task 7. ✓
- `/seleccionar-rol` reutiliza `switchRole` → Task 8. ✓
- Selector de perfil en Navbar, redirige a `/dashboard`, oculto si hay 1 solo rol → Task 9. ✓
- Sidebar sin cambios (ya reactivo vía contexto) → confirmado en el spec, no requiere task propio. ✓

**2. Placeholders:** ninguno — todo el código está completo, comandos con output esperado.

**3. Consistencia de tipos:** `telefonoSecundario` usa el mismo nombre en las 3 capas (Java DTOs, `User`/`Profesor`/`Alumno` entities, TypeScript interfaces) en ambos módulos (Alumno y Profesor). `switchRole(rol: string): void` mismo nombre/firma entre `use-auth.tsx` (Task 7), `seleccionar-rol/page.tsx` (Task 8) y `header.tsx` (Task 9).
