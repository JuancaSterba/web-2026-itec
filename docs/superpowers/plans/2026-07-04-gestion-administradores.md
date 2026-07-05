# Gestión de Administradores Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Dar de alta, listar, editar y resetear contraseña de usuarios `ADMIN`/`ADMINISTRATIVO` desde una pantalla nueva `/dashboard/administradores`, hoy inexistente.

**Architecture:** Nuevo `AdminUsuarioController` + `UserAdminService` en el módulo `security` (dueño de `User`/`UserRepository`), path `/api/administradores`, reusando la ruta de gateway ya existente `/api/core/** → /api/**`. Frontend clona el patrón de `profesores` (service.ts + form-dialog + page.tsx).

**Tech Stack:** Spring Boot 3.2.5 / Java 17 (Spring Data JPA, Spring Security method security, BCrypt), Next.js/React (TypeScript, sin Zod/Yup — validación manual con regex), JUnit 5 + Mockito + AssertJ.

## Global Constraints

- Todo endpoint responde `ApiResponse<T>` (`meta/data/errors`), construido con `MetaBuilderHelper.buildMeta(httpRequest)` — ver `backend/core/.../controller/ProfesorController.java`.
- Todo endpoint lleva `@PreAuthorize(...)` explícito — ningún endpoint queda sin anotar (patrón ya usado en 11+ controllers).
- Cuentas auto-generadas: `username = DNI`, `password = BCrypt(DNI)` — mismo criterio que Alumno/Profesor (`UserLookupPortImpl.crearConCredencialesPorDni`), pero acá `enabled = true` (a diferencia de Alumno/Profesor que nacen `enabled=false`, porque este módulo SÍ tiene login inmediato).
- DNI regex `^\d{7,8}$`, teléfono regex `^\d{6,15}$` — mismos patrones que `RegisterUserRequest`/`ProfesorRegistroDTO`.
- Frontend NO usa Zod/Yup en ningún formulario existente — validación manual (ver `profesor-form-dialog.tsx`). Seguir el mismo estilo, no introducir una librería nueva.
- Frontend NO tiene guard de página por rol (solo filtro de sidebar) — no introducir uno nuevo, es inconsistente con el resto del sistema.
- Sin tests de controller ni de frontend en todo el repo (verificado: solo 1 test real de servicio, `AlumnoInscriptoServiceImplTest`, más 2 tests de contexto vacíos). Seguir esa convención: tests unitarios solo en la capa de servicio (Mockito), controller y frontend se verifican manualmente (curl + navegador).
- No tocar `api-gateway` — la ruta `Path=/api/core/** → rewrite /api/**` ya cubre cualquier controller nuevo dentro del app `core`/`security`/`commons` (mismo deployable, módulo `backend/api`).
- Búsqueda de listado es client-side (`useMemo` + `.filter()`), igual que `dashboard/profesores/page.tsx` — NO agregar un query param `search` al backend (evita reintroducir el problema que ya se resolvió para asistencias/notas, que era un caso distinto: filtros relacionales, no texto libre).

---

### Task 1: Repositorio y DTOs (capa de datos)

**Files:**
- Modify: `backend/security/src/main/java/ar/edu/itec1misiones/security/repository/UserRepository.java`
- Create: `backend/commons/src/main/java/ar/edu/itec1misiones/dto/request/CrearAdministradorRequest.java`
- Create: `backend/commons/src/main/java/ar/edu/itec1misiones/dto/request/ActualizarAdministradorRequest.java`
- Create: `backend/commons/src/main/java/ar/edu/itec1misiones/dto/response/UsuarioAdminResponse.java`

**Interfaces:**
- Produces: `UserRepository.findByRolesIn(Collection<Rol>): List<User>`, `CrearAdministradorRequest{nombre,apellido,dni,email,telefono,rol}`, `ActualizarAdministradorRequest{nombre,apellido,email,telefono,rol,enabled}`, `UsuarioAdminResponse.builder(){id,username,nombre,apellido,dni,email,telefono,rol,enabled}` — usados por Task 3 (servicio) y Task 4 (controller).

No hay lógica que testear en este task (son DTOs planos + una query declarativa); se verifica indirectamente en Task 3 mediante mocks del repositorio.

- [ ] **Step 1: Agregar `findByRolesIn` a `UserRepository`**

```java
package ar.edu.itec1misiones.security.repository;

import ar.edu.itec1misiones.model.Rol;
import ar.edu.itec1misiones.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    boolean existsByUsername(String username);
    boolean existsByDni(String dni);
    boolean existsByEmail(String email);
    boolean existsByTelefono(String telefono);

    @Query("SELECT DISTINCT u FROM User u JOIN u.roles r WHERE r IN :roles")
    List<User> findByRolesIn(@Param("roles") Collection<Rol> roles);
}
```

- [ ] **Step 2: Crear `CrearAdministradorRequest`**

```java
package ar.edu.itec1misiones.dto.request;

import ar.edu.itec1misiones.model.Rol;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class CrearAdministradorRequest {

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

    @NotNull(message = "El rol es obligatorio")
    private Rol rol;
}
```

- [ ] **Step 3: Crear `ActualizarAdministradorRequest`**

```java
package ar.edu.itec1misiones.dto.request;

import ar.edu.itec1misiones.model.Rol;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class ActualizarAdministradorRequest {

    @NotBlank(message = "El nombre es obligatorio")
    private String nombre;

    @NotBlank(message = "El apellido es obligatorio")
    private String apellido;

    @NotBlank(message = "El email es obligatorio")
    @Email(message = "El email no es válido")
    private String email;

    @NotBlank(message = "El teléfono es obligatorio")
    @Pattern(regexp = "\\d{6,15}", message = "El teléfono debe contener entre 6 y 15 números")
    private String telefono;

    @NotNull(message = "El rol es obligatorio")
    private Rol rol;

    private boolean enabled;
}
```

- [ ] **Step 4: Crear `UsuarioAdminResponse`**

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
    private String nombre;
    private String apellido;
    private String dni;
    private String email;
    private String telefono;
    private Rol rol;
    private boolean enabled;
}
```

- [ ] **Step 5: Compilar el módulo `security` para confirmar que todo tipa bien**

Run: `cd backend && mvn -pl security -am compile -q`
Expected: `BUILD SUCCESS` (sin errores de compilación en `commons`/`security`).

- [ ] **Step 6: Commit**

```bash
git add backend/security/src/main/java/ar/edu/itec1misiones/security/repository/UserRepository.java backend/commons/src/main/java/ar/edu/itec1misiones/dto/request/CrearAdministradorRequest.java backend/commons/src/main/java/ar/edu/itec1misiones/dto/request/ActualizarAdministradorRequest.java backend/commons/src/main/java/ar/edu/itec1misiones/dto/response/UsuarioAdminResponse.java
git commit -m "feat(backend): agregar DTOs y query de administradores por rol"
```

---

### Task 2: Excepciones y mapeo de errores

**Files:**
- Create: `backend/security/src/main/java/ar/edu/itec1misiones/security/exception/AdministradorNotFoundException.java`
- Create: `backend/security/src/main/java/ar/edu/itec1misiones/security/exception/AdministradorDatosDuplicadosException.java`
- Create: `backend/security/src/main/java/ar/edu/itec1misiones/security/exception/SelfActionNotAllowedException.java`
- Create: `backend/security/src/main/java/ar/edu/itec1misiones/security/exception/RolNoGestionableException.java`
- Modify: `backend/security/src/main/java/ar/edu/itec1misiones/security/constants/ExceptionConstants.java`
- Modify: `backend/security/src/main/java/ar/edu/itec1misiones/security/exception/SecurityExceptionHandler.java`

**Interfaces:**
- Consumes: nada de tasks anteriores.
- Produces: 4 excepciones + sus handlers HTTP (404, 409, 400, 400) — consumidas por `UserAdminServiceImpl` en Task 3 (las lanza) y verificadas ahí vía `assertThatThrownBy(...).isInstanceOf(...)`.

- [ ] **Step 1: Crear `AdministradorNotFoundException`**

```java
package ar.edu.itec1misiones.security.exception;

public class AdministradorNotFoundException extends RuntimeException {
    public AdministradorNotFoundException(Long id) {
        super("No se encontró un administrador con id " + id);
    }
}
```

- [ ] **Step 2: Crear `AdministradorDatosDuplicadosException`**

```java
package ar.edu.itec1misiones.security.exception;

import java.util.List;

public class AdministradorDatosDuplicadosException extends RuntimeException {

    private final List<String> errores;

    public AdministradorDatosDuplicadosException(List<String> errores) {
        super(String.join(". ", errores));
        this.errores = errores;
    }

    public List<String> getErrores() {
        return errores;
    }
}
```

- [ ] **Step 3: Crear `SelfActionNotAllowedException`**

```java
package ar.edu.itec1misiones.security.exception;

public class SelfActionNotAllowedException extends RuntimeException {
    public SelfActionNotAllowedException(String message) {
        super(message);
    }
}
```

- [ ] **Step 4: Crear `RolNoGestionableException`**

```java
package ar.edu.itec1misiones.security.exception;

public class RolNoGestionableException extends RuntimeException {
    public RolNoGestionableException(String message) {
        super(message);
    }
}
```

- [ ] **Step 5: Agregar códigos de error a `ExceptionConstants`**

```java
package ar.edu.itec1misiones.security.constants;

public class ExceptionConstants {
    // Códigos de error
    public static final String MSG_CREDENTIALS_INVALID = "Credenciales inválidas";
    public static final String ERROR_USER_ALREADY_EXISTS = "USER_ALREADY_EXISTS";
    public static final String ERROR_DUPLICATED_FIELD = "DUPLICATED_FIELD";
    public static final String ERROR_INTERNAL = "INTERNAL_ERROR";
    public static final String ERROR_AUTH = "AUTH";
    public static final String ERROR_ADMIN_NOT_FOUND = "ADMIN_NOT_FOUND";
    public static final String ERROR_SELF_ACTION_FORBIDDEN = "SELF_ACTION_FORBIDDEN";
    public static final String ERROR_ROL_INVALIDO = "ROL_INVALIDO";
}
```

- [ ] **Step 6: Agregar los 4 handlers a `SecurityExceptionHandler`**

Agregar estos métodos dentro de la clase `SecurityExceptionHandler` (junto a los `@ExceptionHandler` existentes, antes de la llave de cierre final):

```java
    @ExceptionHandler(AdministradorNotFoundException.class)
    public ResponseEntity<ApiResponse<Object>> handleAdministradorNotFound(
            AdministradorNotFoundException ex,
            HttpServletRequest request) {

        ErrorDto error = new ErrorDto(ExceptionConstants.ERROR_ADMIN_NOT_FOUND, ex.getMessage());

        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                ApiResponse.builder()
                        .meta(MetaBuilderHelper.buildMeta(request))
                        .errors(List.of(error))
                        .build()
        );
    }

    @ExceptionHandler(AdministradorDatosDuplicadosException.class)
    public ResponseEntity<ApiResponse<Object>> handleAdministradorDatosDuplicados(
            AdministradorDatosDuplicadosException ex,
            HttpServletRequest request) {

        List<ErrorDto> errores = ex.getErrores().stream()
                .map(msg -> new ErrorDto(ExceptionConstants.ERROR_DUPLICATED_FIELD, msg))
                .collect(Collectors.toList());

        return ResponseEntity.status(HttpStatus.CONFLICT).body(
                ApiResponse.builder()
                        .meta(MetaBuilderHelper.buildMeta(request))
                        .errors(errores)
                        .build()
        );
    }

    @ExceptionHandler(SelfActionNotAllowedException.class)
    public ResponseEntity<ApiResponse<Object>> handleSelfActionNotAllowed(
            SelfActionNotAllowedException ex,
            HttpServletRequest request) {

        ErrorDto error = new ErrorDto(ExceptionConstants.ERROR_SELF_ACTION_FORBIDDEN, ex.getMessage());

        return ResponseEntity.badRequest().body(
                ApiResponse.builder()
                        .meta(MetaBuilderHelper.buildMeta(request))
                        .errors(List.of(error))
                        .build()
        );
    }

    @ExceptionHandler(RolNoGestionableException.class)
    public ResponseEntity<ApiResponse<Object>> handleRolNoGestionable(
            RolNoGestionableException ex,
            HttpServletRequest request) {

        ErrorDto error = new ErrorDto(ExceptionConstants.ERROR_ROL_INVALIDO, ex.getMessage());

        return ResponseEntity.badRequest().body(
                ApiResponse.builder()
                        .meta(MetaBuilderHelper.buildMeta(request))
                        .errors(List.of(error))
                        .build()
        );
    }
```

- [ ] **Step 7: Compilar**

Run: `cd backend && mvn -pl security -am compile -q`
Expected: `BUILD SUCCESS`

- [ ] **Step 8: Commit**

```bash
git add backend/security/src/main/java/ar/edu/itec1misiones/security/exception/AdministradorNotFoundException.java backend/security/src/main/java/ar/edu/itec1misiones/security/exception/AdministradorDatosDuplicadosException.java backend/security/src/main/java/ar/edu/itec1misiones/security/exception/SelfActionNotAllowedException.java backend/security/src/main/java/ar/edu/itec1misiones/security/exception/RolNoGestionableException.java backend/security/src/main/java/ar/edu/itec1misiones/security/constants/ExceptionConstants.java backend/security/src/main/java/ar/edu/itec1misiones/security/exception/SecurityExceptionHandler.java
git commit -m "feat(backend): agregar excepciones y mapeo HTTP para administradores"
```

---

### Task 3: `UserAdminService` (TDD)

**Files:**
- Create: `backend/security/src/main/java/ar/edu/itec1misiones/security/service/UserAdminService.java`
- Create: `backend/security/src/main/java/ar/edu/itec1misiones/security/service/impl/UserAdminServiceImpl.java`
- Test: `backend/security/src/test/java/ar/edu/itec1misiones/security/service/impl/UserAdminServiceImplTest.java`

**Interfaces:**
- Consumes: `UserRepository.findByRolesIn` (Task 1), `AdministradorNotFoundException`/`AdministradorDatosDuplicadosException`/`SelfActionNotAllowedException`/`RolNoGestionableException` (Task 2), `SecurityUtils.getUsername()` (existente, `ar.edu.itec1misiones.security.util.SecurityUtils`), `PasswordEncoder` (bean existente en `SecurityConfig`).
- Produces: `UserAdminService{listar(): List<UsuarioAdminResponse>, crear(CrearAdministradorRequest): UsuarioAdminResponse, actualizar(Long, ActualizarAdministradorRequest): UsuarioAdminResponse, resetPassword(Long): UsuarioAdminResponse}` — consumido por `AdminUsuarioController` en Task 4.

- [ ] **Step 1: Escribir el archivo de tests (falla porque `UserAdminServiceImpl` no existe todavía)**

```java
package ar.edu.itec1misiones.security.service.impl;

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

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserAdminServiceImplTest {

    @Mock UserRepository userRepository;
    @Mock PasswordEncoder passwordEncoder;

    @InjectMocks UserAdminServiceImpl service;

    @AfterEach
    void limpiarContextoSeguridad() {
        SecurityContextHolder.clearContext();
    }

    private void autenticarComo(String username) {
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(username, null, List.of()));
    }

    private User buildUser(Long id, String username, Rol rol, boolean enabled) {
        User user = new User();
        user.setId(id);
        user.setUsername(username);
        user.setNombre("Ana");
        user.setApellido("Gómez");
        user.setDni(username);
        user.setEmail(username + "@itec.edu.ar");
        user.setTelefono("3760000000");
        user.setRoles(Set.of(rol));
        user.setEnabled(enabled);
        return user;
    }

    private CrearAdministradorRequest buildCrearRequest(Rol rol) {
        CrearAdministradorRequest req = new CrearAdministradorRequest();
        req.setNombre("Ana");
        req.setApellido("Gómez");
        req.setDni("30111222");
        req.setEmail("ana@itec.edu.ar");
        req.setTelefono("3760000000");
        req.setRol(rol);
        return req;
    }

    @Test
    void crear_lanzaRolNoGestionableException_siRolNoEsAdminNiAdministrativo() {
        CrearAdministradorRequest request = buildCrearRequest(Rol.PROFESOR);

        assertThatThrownBy(() -> service.crear(request))
                .isInstanceOf(RolNoGestionableException.class);

        verifyNoInteractions(userRepository);
    }

    @Test
    void crear_lanzaAdministradorDatosDuplicadosException_siDniYaExiste() {
        CrearAdministradorRequest request = buildCrearRequest(Rol.ADMINISTRATIVO);
        when(userRepository.existsByUsername("30111222")).thenReturn(true);
        when(userRepository.existsByDni("30111222")).thenReturn(true);
        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(userRepository.existsByTelefono(anyString())).thenReturn(false);

        assertThatThrownBy(() -> service.crear(request))
                .isInstanceOf(AdministradorDatosDuplicadosException.class);

        verify(userRepository, never()).save(any());
    }

    @Test
    void crear_creaUsuarioConUsernameYPasswordIgualesAlDni_siDatosValidos() {
        CrearAdministradorRequest request = buildCrearRequest(Rol.ADMIN);
        when(userRepository.existsByUsername(anyString())).thenReturn(false);
        when(userRepository.existsByDni(anyString())).thenReturn(false);
        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(userRepository.existsByTelefono(anyString())).thenReturn(false);
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

    @Test
    void listar_devuelveSoloUsuariosConRolAdminOAdministrativo() {
        User admin = buildUser(1L, "11111111", Rol.ADMIN, true);
        User administrativo = buildUser(2L, "22222222", Rol.ADMINISTRATIVO, true);
        when(userRepository.findByRolesIn(List.of(Rol.ADMIN, Rol.ADMINISTRATIVO)))
                .thenReturn(List.of(admin, administrativo));

        List<UsuarioAdminResponse> resultado = service.listar();

        assertThat(resultado).hasSize(2);
        assertThat(resultado).extracting(UsuarioAdminResponse::getUsername)
                .containsExactlyInAnyOrder("11111111", "22222222");
    }

    @Test
    void actualizar_lanzaAdministradorNotFoundException_siNoExiste() {
        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        ActualizarAdministradorRequest request = new ActualizarAdministradorRequest();
        assertThatThrownBy(() -> service.actualizar(99L, request))
                .isInstanceOf(AdministradorNotFoundException.class);
    }

    @Test
    void actualizar_lanzaSelfActionNotAllowedException_siSeDeshabilitaASiMismo() {
        User propio = buildUser(1L, "11111111", Rol.ADMIN, true);
        when(userRepository.findById(1L)).thenReturn(Optional.of(propio));
        autenticarComo("11111111");

        ActualizarAdministradorRequest request = new ActualizarAdministradorRequest();
        request.setNombre("Ana");
        request.setApellido("Gómez");
        request.setEmail("ana@itec.edu.ar");
        request.setTelefono("3760000000");
        request.setRol(Rol.ADMIN);
        request.setEnabled(false);

        assertThatThrownBy(() -> service.actualizar(1L, request))
                .isInstanceOf(SelfActionNotAllowedException.class);

        verify(userRepository, never()).save(any());
    }

    @Test
    void actualizar_lanzaSelfActionNotAllowedException_siCambiaSuPropioRol() {
        User propio = buildUser(1L, "11111111", Rol.ADMIN, true);
        when(userRepository.findById(1L)).thenReturn(Optional.of(propio));
        autenticarComo("11111111");

        ActualizarAdministradorRequest request = new ActualizarAdministradorRequest();
        request.setNombre("Ana");
        request.setApellido("Gómez");
        request.setEmail("ana@itec.edu.ar");
        request.setTelefono("3760000000");
        request.setRol(Rol.ADMINISTRATIVO);
        request.setEnabled(true);

        assertThatThrownBy(() -> service.actualizar(1L, request))
                .isInstanceOf(SelfActionNotAllowedException.class);
    }

    @Test
    void actualizar_actualizaDatosRolYEstado_siEsOtroUsuario() {
        User otro = buildUser(2L, "22222222", Rol.ADMINISTRATIVO, true);
        when(userRepository.findById(2L)).thenReturn(Optional.of(otro));
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));
        autenticarComo("11111111");

        ActualizarAdministradorRequest request = new ActualizarAdministradorRequest();
        request.setNombre("Ana Actualizada");
        request.setApellido("Gómez");
        request.setEmail("ana2@itec.edu.ar");
        request.setTelefono("3760000001");
        request.setRol(Rol.ADMIN);
        request.setEnabled(false);

        UsuarioAdminResponse response = service.actualizar(2L, request);

        assertThat(response.getNombre()).isEqualTo("Ana Actualizada");
        assertThat(response.getRol()).isEqualTo(Rol.ADMIN);
        assertThat(response.isEnabled()).isFalse();
    }

    @Test
    void resetPassword_reencriptaPasswordUsandoElDniActual() {
        User user = buildUser(3L, "33333333", Rol.ADMIN, true);
        when(userRepository.findById(3L)).thenReturn(Optional.of(user));
        when(passwordEncoder.encode("33333333")).thenReturn("HASH_33333333");
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

        service.resetPassword(3L);

        verify(userRepository).save(argThat(u -> u.getPassword().equals("HASH_33333333")));
    }
}
```

- [ ] **Step 2: Correr los tests para confirmar que fallan (no compila: falta `UserAdminService`/`UserAdminServiceImpl`)**

Run: `cd backend && mvn -pl security -am test -Dtest=UserAdminServiceImplTest -q`
Expected: FAIL — error de compilación, `cannot find symbol UserAdminServiceImpl`.

- [ ] **Step 3: Crear la interfaz `UserAdminService`**

```java
package ar.edu.itec1misiones.security.service;

import ar.edu.itec1misiones.dto.request.ActualizarAdministradorRequest;
import ar.edu.itec1misiones.dto.request.CrearAdministradorRequest;
import ar.edu.itec1misiones.dto.response.UsuarioAdminResponse;

import java.util.List;

public interface UserAdminService {
    List<UsuarioAdminResponse> listar();
    UsuarioAdminResponse crear(CrearAdministradorRequest request);
    UsuarioAdminResponse actualizar(Long id, ActualizarAdministradorRequest request);
    UsuarioAdminResponse resetPassword(Long id);
}
```

- [ ] **Step 4: Implementar `UserAdminServiceImpl`**

```java
package ar.edu.itec1misiones.security.service.impl;

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

    @Override
    @Transactional(readOnly = true)
    public List<UsuarioAdminResponse> listar() {
        return userRepository.findByRolesIn(ROLES_GESTIONABLES).stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public UsuarioAdminResponse crear(CrearAdministradorRequest request) {
        validarRolGestionable(request.getRol());

        List<String> errores = new ArrayList<>();
        if (userRepository.existsByUsername(request.getDni())) {
            errores.add("Ya existe un usuario con username '" + request.getDni() + "'");
        }
        if (userRepository.existsByDni(request.getDni())) {
            errores.add("El DNI '" + request.getDni() + "' ya está en uso");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            errores.add("El email '" + request.getEmail() + "' ya está en uso");
        }
        if (userRepository.existsByTelefono(request.getTelefono())) {
            errores.add("El teléfono '" + request.getTelefono() + "' ya está en uso");
        }
        if (!errores.isEmpty()) {
            throw new AdministradorDatosDuplicadosException(errores);
        }

        User user = new User();
        user.setUsername(request.getDni());
        user.setPassword(passwordEncoder.encode(request.getDni()));
        user.setRoles(Set.of(request.getRol()));
        user.setNombre(request.getNombre());
        user.setApellido(request.getApellido());
        user.setDni(request.getDni());
        user.setEmail(request.getEmail());
        user.setTelefono(request.getTelefono());
        user.setEnabled(true);

        return toResponse(userRepository.save(user));
    }

    @Override
    public UsuarioAdminResponse actualizar(Long id, ActualizarAdministradorRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new AdministradorNotFoundException(id));

        validarRolGestionable(request.getRol());

        boolean esUsuarioActual = user.getUsername().equals(SecurityUtils.getUsername());
        boolean cambiaRol = !user.getRoles().contains(request.getRol());
        boolean seDeshabilita = !request.isEnabled();

        if (esUsuarioActual && (cambiaRol || seDeshabilita)) {
            throw new SelfActionNotAllowedException("No podés deshabilitarte o cambiar tu propio rol");
        }

        user.setNombre(request.getNombre());
        user.setApellido(request.getApellido());
        user.setEmail(request.getEmail());
        user.setTelefono(request.getTelefono());
        user.setRoles(Set.of(request.getRol()));
        user.setEnabled(request.isEnabled());

        return toResponse(userRepository.save(user));
    }

    @Override
    public UsuarioAdminResponse resetPassword(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new AdministradorNotFoundException(id));

        user.setPassword(passwordEncoder.encode(user.getDni()));

        return toResponse(userRepository.save(user));
    }

    private void validarRolGestionable(Rol rol) {
        if (!ROLES_GESTIONABLES.contains(rol)) {
            throw new RolNoGestionableException("Rol no gestionable desde este módulo: " + rol);
        }
    }

    private UsuarioAdminResponse toResponse(User user) {
        Rol rolPrincipal = user.getRoles().stream()
                .filter(ROLES_GESTIONABLES::contains)
                .findFirst()
                .orElse(null);

        return UsuarioAdminResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .nombre(user.getNombre())
                .apellido(user.getApellido())
                .dni(user.getDni())
                .email(user.getEmail())
                .telefono(user.getTelefono())
                .rol(rolPrincipal)
                .enabled(user.isEnabled())
                .build();
    }
}
```

- [ ] **Step 5: Correr los tests y confirmar que pasan**

Run: `cd backend && mvn -pl security -am test -Dtest=UserAdminServiceImplTest -q`
Expected: `Tests run: 9, Failures: 0, Errors: 0`

- [ ] **Step 6: Commit**

```bash
git add backend/security/src/main/java/ar/edu/itec1misiones/security/service/UserAdminService.java backend/security/src/main/java/ar/edu/itec1misiones/security/service/impl/UserAdminServiceImpl.java backend/security/src/test/java/ar/edu/itec1misiones/security/service/impl/UserAdminServiceImplTest.java
git commit -m "feat(backend): UserAdminService con TDD (crear/listar/actualizar/reset-password)"
```

---

### Task 4: `AdminUsuarioController`

**Files:**
- Create: `backend/security/src/main/java/ar/edu/itec1misiones/security/controller/AdminUsuarioController.java`

**Interfaces:**
- Consumes: `UserAdminService` (Task 3), `ApiResponse<T>`/`MetaBuilderHelper` (existentes, `ar.edu.itec1misiones.dto.*`).
- Produces: endpoints REST consumidos por el frontend en Task 5.

- [ ] **Step 1: Crear el controller**

```java
package ar.edu.itec1misiones.security.controller;

import ar.edu.itec1misiones.dto.ApiResponse;
import ar.edu.itec1misiones.dto.request.ActualizarAdministradorRequest;
import ar.edu.itec1misiones.dto.request.CrearAdministradorRequest;
import ar.edu.itec1misiones.dto.response.MetaBuilderHelper;
import ar.edu.itec1misiones.dto.response.UsuarioAdminResponse;
import ar.edu.itec1misiones.security.service.UserAdminService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/administradores")
@Tag(name = "Administradores", description = "Alta, listado, edición y reset de contraseña de usuarios ADMIN/ADMINISTRATIVO")
public class AdminUsuarioController {

    private final UserAdminService userAdminService;

    public AdminUsuarioController(UserAdminService userAdminService) {
        this.userAdminService = userAdminService;
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Listar usuarios con rol ADMIN o ADMINISTRATIVO")
    public ResponseEntity<ApiResponse<UsuarioAdminResponse>> listar(HttpServletRequest httpRequest) {
        List<UsuarioAdminResponse> administradores = userAdminService.listar();
        return ResponseEntity.ok(
                ApiResponse.<UsuarioAdminResponse>builder()
                        .meta(MetaBuilderHelper.buildMeta(httpRequest))
                        .data(administradores)
                        .build()
        );
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Crear un usuario ADMIN o ADMINISTRATIVO (username/password = DNI)")
    public ResponseEntity<ApiResponse<UsuarioAdminResponse>> crear(
            @RequestBody @Valid CrearAdministradorRequest request,
            HttpServletRequest httpRequest) {

        UsuarioAdminResponse administrador = userAdminService.crear(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(
                ApiResponse.<UsuarioAdminResponse>builder()
                        .meta(MetaBuilderHelper.buildMeta(httpRequest))
                        .data(List.of(administrador))
                        .build()
        );
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Actualizar datos, rol o estado de un administrador")
    public ResponseEntity<ApiResponse<UsuarioAdminResponse>> actualizar(
            @PathVariable Long id,
            @RequestBody @Valid ActualizarAdministradorRequest request,
            HttpServletRequest httpRequest) {

        UsuarioAdminResponse administrador = userAdminService.actualizar(id, request);
        return ResponseEntity.ok(
                ApiResponse.<UsuarioAdminResponse>builder()
                        .meta(MetaBuilderHelper.buildMeta(httpRequest))
                        .data(List.of(administrador))
                        .build()
        );
    }

    @PostMapping("/{id}/reset-password")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Resetear la contraseña de un administrador a su DNI")
    public ResponseEntity<ApiResponse<UsuarioAdminResponse>> resetPassword(
            @PathVariable Long id,
            HttpServletRequest httpRequest) {

        UsuarioAdminResponse administrador = userAdminService.resetPassword(id);
        return ResponseEntity.ok(
                ApiResponse.<UsuarioAdminResponse>builder()
                        .meta(MetaBuilderHelper.buildMeta(httpRequest))
                        .data(List.of(administrador))
                        .build()
        );
    }
}
```

- [ ] **Step 2: Compilar todo el backend**

Run: `cd backend && mvn -pl api -am compile -q`
Expected: `BUILD SUCCESS`

- [ ] **Step 3: Commit**

```bash
git add backend/security/src/main/java/ar/edu/itec1misiones/security/controller/AdminUsuarioController.java
git commit -m "feat(backend): AdminUsuarioController con endpoints CRUD de administradores"
```

---

### Task 5: Frontend — `administradores.service.ts`

**Files:**
- Create: `frontend/lib/services/administradores.service.ts`

**Interfaces:**
- Consumes: `apiClient` (`@/lib/api-client`, ya existente — `get/post/put`).
- Produces: `Administrador{id,username,nombre,apellido,dni,email,telefono,rol,enabled}`, `listarAdministradores(): Promise<Administrador[]>`, `crearAdministrador(input): Promise<Administrador>`, `actualizarAdministrador(id, input): Promise<Administrador>`, `resetPasswordAdministrador(id): Promise<Administrador>` — consumidos por Task 6 y 7.

- [ ] **Step 1: Crear el archivo de servicio**

```typescript
import apiClient from "@/lib/api-client"

export type RolAdministrador = "ADMIN" | "ADMINISTRATIVO"

// Coincide con UsuarioAdminResponse del backend (modulo security).
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

// POST /api/core/administradores: alta de un solo paso, username=DNI,
// password=DNI encriptada (BCrypt), enabled=true (a diferencia de Alumno/
// Profesor, este rol si tiene login inmediato).
export interface CrearAdministradorInput {
  nombre: string
  apellido: string
  dni: string
  email: string
  telefono: string
  rol: RolAdministrador
}

export interface ActualizarAdministradorInput {
  nombre: string
  apellido: string
  email: string
  telefono: string
  rol: RolAdministrador
  enabled: boolean
}

const BASE_PATH = "/api/core/administradores"

export async function listarAdministradores(): Promise<Administrador[]> {
  const response = await apiClient.get<Administrador[]>(BASE_PATH)
  return response.data
}

export async function crearAdministrador(input: CrearAdministradorInput): Promise<Administrador> {
  const response = await apiClient.post<Administrador[]>(BASE_PATH, input)
  return response.data[0]
}

export async function actualizarAdministrador(
  id: number,
  input: ActualizarAdministradorInput
): Promise<Administrador> {
  const response = await apiClient.put<Administrador[]>(`${BASE_PATH}/${id}`, input)
  return response.data[0]
}

export async function resetPasswordAdministrador(id: number): Promise<Administrador> {
  const response = await apiClient.post<Administrador[]>(`${BASE_PATH}/${id}/reset-password`)
  return response.data[0]
}
```

- [ ] **Step 2: Typecheck**

Run: `cd frontend && npx tsc --noEmit 2>&1 | grep administradores`
Expected: sin salida (ningún error en el archivo nuevo; los errores preexistentes de `node_modules` no relacionados quedan fuera del grep).

- [ ] **Step 3: Commit**

```bash
git add frontend/lib/services/administradores.service.ts
git commit -m "feat(frontend): servicio administradores.service.ts"
```

---

### Task 6: Frontend — form dialog y reset-password dialog

**Files:**
- Create: `frontend/components/administradores/administrador-form-dialog.tsx`
- Create: `frontend/components/administradores/reset-password-administrador-dialog.tsx`

**Interfaces:**
- Consumes: `Administrador`, `crearAdministrador`, `actualizarAdministrador`, `resetPasswordAdministrador` (Task 5); `useAuth()` de `@/hooks/use-auth` (`user.username`, ya existente) para el auto-bloqueo en UI.
- Produces: `<AdministradorFormDialog open onOpenChange administrador onSuccess />`, `<ResetPasswordAdministradorDialog open onOpenChange administrador onSuccess />` — consumidos por Task 7.

- [ ] **Step 1: Crear `administrador-form-dialog.tsx`**

```tsx
"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useAuth } from "@/hooks/use-auth"
import {
  actualizarAdministrador,
  crearAdministrador,
  type Administrador,
  type RolAdministrador,
} from "@/lib/services/administradores.service"

interface AdministradorFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  administrador: Administrador | null
  onSuccess: (administrador: Administrador) => void
}

const emptyForm = {
  nombre: "",
  apellido: "",
  dni: "",
  email: "",
  telefono: "",
  rol: "ADMINISTRATIVO" as RolAdministrador,
}

export function AdministradorFormDialog({
  open,
  onOpenChange,
  administrador,
  onSuccess,
}: AdministradorFormDialogProps) {
  const { user } = useAuth()
  const isEditing = !!administrador
  const esUsuarioActual = isEditing && administrador!.username === user?.username

  const [form, setForm] = useState(emptyForm)
  const [enabled, setEnabled] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      setForm({
        ...emptyForm,
        nombre: administrador?.nombre ?? "",
        apellido: administrador?.apellido ?? "",
        dni: administrador?.dni ?? "",
        email: administrador?.email ?? "",
        telefono: administrador?.telefono ?? "",
        rol: administrador?.rol ?? "ADMINISTRATIVO",
      })
      setEnabled(administrador?.enabled ?? true)
      setError(null)
    }
  }, [open, administrador])

  const setField = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const validar = (): string | null => {
    if (!form.nombre.trim()) return "El nombre es obligatorio"
    if (!form.apellido.trim()) return "El apellido es obligatorio"
    if (!isEditing && !/^\d{7,8}$/.test(form.dni)) return "El DNI debe tener 7 u 8 dígitos"
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return "El email no es válido"
    if (!/^\d{6,15}$/.test(form.telefono)) return "El teléfono debe tener entre 6 y 15 dígitos"
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const validationError = validar()
    if (validationError) {
      setError(validationError)
      return
    }

    setSubmitting(true)
    setError(null)
    try {
      if (isEditing) {
        const actualizado = await actualizarAdministrador(administrador!.id, {
          nombre: form.nombre.trim(),
          apellido: form.apellido.trim(),
          email: form.email.trim(),
          telefono: form.telefono.trim(),
          rol: form.rol,
          enabled,
        })
        toast.success("Administrador actualizado correctamente")
        onSuccess(actualizado)
      } else {
        const creado = await crearAdministrador({
          nombre: form.nombre.trim(),
          apellido: form.apellido.trim(),
          dni: form.dni.trim(),
          email: form.email.trim(),
          telefono: form.telefono.trim(),
          rol: form.rol,
        })
        toast.success("Administrador creado correctamente", {
          description: `Usuario autogenerado: ${form.dni} / Contraseña: ${form.dni}`,
        })
        onSuccess(creado)
      }
      onOpenChange(false)
    } catch (err: any) {
      const message = err?.message || "No se pudo guardar el administrador"
      setError(message)
      toast.error(message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar administrador" : "Nuevo administrador"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Datos de contacto, rol y estado son editables desde acá."
              : "El sistema crea automáticamente el usuario (username y contraseña = DNI)."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
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

          {!isEditing && (
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
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={form.email} onChange={setField("email")} disabled={submitting} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="telefono">Teléfono</Label>
              <Input id="telefono" value={form.telefono} onChange={setField("telefono")} disabled={submitting} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Rol</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                variant={form.rol === "ADMIN" ? "default" : "outline"}
                onClick={() => setForm((prev) => ({ ...prev, rol: "ADMIN" }))}
                disabled={submitting || esUsuarioActual}
                className="flex-1"
              >
                Admin
              </Button>
              <Button
                type="button"
                size="sm"
                variant={form.rol === "ADMINISTRATIVO" ? "default" : "outline"}
                onClick={() => setForm((prev) => ({ ...prev, rol: "ADMINISTRATIVO" }))}
                disabled={submitting || esUsuarioActual}
                className="flex-1"
              >
                Administrativo
              </Button>
            </div>
            {esUsuarioActual && (
              <p className="text-xs text-muted-foreground">No podés cambiar tu propio rol.</p>
            )}
          </div>

          {isEditing && (
            <div className="space-y-2">
              <Label>Estado</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant={enabled ? "default" : "outline"}
                  onClick={() => setEnabled(true)}
                  disabled={submitting}
                  className="flex-1"
                >
                  Activo
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={!enabled ? "secondary" : "outline"}
                  onClick={() => setEnabled(false)}
                  disabled={submitting || esUsuarioActual}
                  className="flex-1"
                >
                  Inactivo
                </Button>
              </div>
              {esUsuarioActual && (
                <p className="text-xs text-muted-foreground">No podés deshabilitar tu propia cuenta.</p>
              )}
            </div>
          )}

          {error && <p className="text-sm text-destructive">{error}</p>}

          <DialogFooter>
            <Button type="submit" disabled={submitting} className="w-full sm:w-auto">
              {submitting && <Loader2 className="size-4 animate-spin" />}
              {isEditing ? "Guardar cambios" : "Crear administrador"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
```

- [ ] **Step 2: Crear `reset-password-administrador-dialog.tsx`**

```tsx
"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { resetPasswordAdministrador, type Administrador } from "@/lib/services/administradores.service"

interface ResetPasswordAdministradorDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  administrador: Administrador | null
  onSuccess: (administrador: Administrador) => void
}

export function ResetPasswordAdministradorDialog({
  open,
  onOpenChange,
  administrador,
  onSuccess,
}: ResetPasswordAdministradorDialogProps) {
  const [submitting, setSubmitting] = useState(false)

  const handleReset = async () => {
    if (!administrador) return
    setSubmitting(true)
    try {
      const actualizado = await resetPasswordAdministrador(administrador.id)
      toast.success("Contraseña reseteada correctamente", {
        description: `Nueva contraseña: ${administrador.dni}`,
      })
      onSuccess(actualizado)
      onOpenChange(false)
    } catch (err: any) {
      toast.error(err?.message || "No se pudo resetear la contraseña")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Resetear contraseña</DialogTitle>
          <DialogDescription>
            {administrador && (
              <>
                La contraseña de <strong>{administrador.nombre} {administrador.apellido}</strong> va a
                volver a ser su DNI ({administrador.dni}). Esta acción no se puede deshacer.
              </>
            )}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
            Cancelar
          </Button>
          <Button variant="destructive" onClick={handleReset} disabled={submitting}>
            {submitting && <Loader2 className="size-4 animate-spin" />}
            Resetear
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
```

- [ ] **Step 3: Typecheck**

Run: `cd frontend && npx tsc --noEmit 2>&1 | grep administradores`
Expected: sin salida.

- [ ] **Step 4: Commit**

```bash
git add frontend/components/administradores/administrador-form-dialog.tsx frontend/components/administradores/reset-password-administrador-dialog.tsx
git commit -m "feat(frontend): dialogs de alta/edicion y reset de password de administradores"
```

---

### Task 7: Frontend — página, sidebar y verificación end-to-end

**Files:**
- Create: `frontend/app/dashboard/administradores/page.tsx`
- Modify: `frontend/components/layout/sidebar.tsx`

**Interfaces:**
- Consumes: `listarAdministradores` (Task 5), `AdministradorFormDialog`, `ResetPasswordAdministradorDialog` (Task 6).

- [ ] **Step 1: Crear `frontend/app/dashboard/administradores/page.tsx`**

```tsx
"use client"

import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { Plus, Search, Pencil, KeyRound, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Card } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { AdministradorFormDialog } from "@/components/administradores/administrador-form-dialog"
import { ResetPasswordAdministradorDialog } from "@/components/administradores/reset-password-administrador-dialog"
import { listarAdministradores, type Administrador } from "@/lib/services/administradores.service"

export default function AdministradoresPage() {
  const [administradores, setAdministradores] = useState<Administrador[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  const [formOpen, setFormOpen] = useState(false)
  const [editingAdministrador, setEditingAdministrador] = useState<Administrador | null>(null)

  const [resetOpen, setResetOpen] = useState(false)
  const [resettingAdministrador, setResettingAdministrador] = useState<Administrador | null>(null)

  const cargarAdministradores = async () => {
    setLoading(true)
    try {
      const data = await listarAdministradores()
      setAdministradores(data)
    } catch (err: any) {
      toast.error(err?.message || "No se pudieron cargar los administradores")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargarAdministradores()
  }, [])

  const administradoresFiltrados = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    if (!term) return administradores
    return administradores.filter((a) =>
      [a.nombre, a.apellido, a.dni, a.email].some((campo) => campo?.toLowerCase().includes(term))
    )
  }, [administradores, searchTerm])

  const abrirCrear = () => {
    setEditingAdministrador(null)
    setFormOpen(true)
  }

  const abrirEditar = (administrador: Administrador) => {
    setEditingAdministrador(administrador)
    setFormOpen(true)
  }

  const abrirReset = (administrador: Administrador) => {
    setResettingAdministrador(administrador)
    setResetOpen(true)
  }

  const handleGuardado = (administrador: Administrador) => {
    setAdministradores((prev) => {
      const existe = prev.some((a) => a.id === administrador.id)
      return existe ? prev.map((a) => (a.id === administrador.id ? administrador : a)) : [...prev, administrador]
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-3xl font-semibold text-foreground">Gestión de Administradores</h1>
          <p className="text-sm text-muted-foreground">Administra los usuarios ADMIN y ADMINISTRATIVO</p>
        </div>
        <Button onClick={abrirCrear}>
          <Plus className="size-4" />
          Nuevo Administrador
        </Button>
      </div>

      <Card className="p-4">
        <div className="relative max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre, DNI o email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
      </Card>

      <Card>
        {loading ? (
          <div className="space-y-3 p-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : administradores.length === 0 ? (
          <EmptyState onCrear={abrirCrear} />
        ) : administradoresFiltrados.length === 0 ? (
          <div className="flex flex-col items-center gap-2 p-12 text-center">
            <Search className="size-8 text-muted-foreground" />
            <p className="font-medium text-foreground">Sin resultados</p>
            <p className="text-sm text-muted-foreground">
              Ningún administrador coincide con &ldquo;{searchTerm}&rdquo;.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Apellido</TableHead>
                <TableHead>DNI</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {administradoresFiltrados.map((administrador) => (
                <TableRow key={administrador.id}>
                  <TableCell className="font-medium">{administrador.nombre}</TableCell>
                  <TableCell>{administrador.apellido}</TableCell>
                  <TableCell>{administrador.dni}</TableCell>
                  <TableCell className="text-muted-foreground">{administrador.email}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{administrador.rol}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={administrador.enabled ? "default" : "secondary"}>
                      {administrador.enabled ? "Activo" : "Inactivo"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => abrirEditar(administrador)} aria-label="Editar">
                        <Pencil className="size-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => abrirReset(administrador)} aria-label="Resetear contraseña">
                        <KeyRound className="size-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      <AdministradorFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        administrador={editingAdministrador}
        onSuccess={handleGuardado}
      />
      <ResetPasswordAdministradorDialog
        open={resetOpen}
        onOpenChange={setResetOpen}
        administrador={resettingAdministrador}
        onSuccess={handleGuardado}
      />
    </div>
  )
}

function EmptyState({ onCrear }: { onCrear: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 p-16 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
        <ShieldCheck className="size-7" />
      </div>
      <div>
        <p className="font-display text-lg font-semibold text-foreground">Todavía no hay administradores</p>
        <p className="text-sm text-muted-foreground">Creá el primero para empezar a delegar tareas.</p>
      </div>
      <Button onClick={onCrear} className="mt-2">
        <Plus className="size-4" />
        Nuevo Administrador
      </Button>
    </div>
  )
}
```

- [ ] **Step 2: Agregar el ítem al sidebar**

En `frontend/components/layout/sidebar.tsx`, agregar `UserCog` al import de `lucide-react` y una entrada nueva en `navigation` (después de "Configuración", que sigue comentada — ver `.remember/PENDIENTES.md` Prioridad 1):

```typescript
import {
  Home,
  Users,
  GraduationCap,
  Calendar,
  ClipboardCheck,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  UserCog,
} from "lucide-react"
```

```typescript
  { name: "Administradores", href: "/dashboard/administradores", icon: UserCog, roles: ["ADMIN"] },
```

- [ ] **Step 3: Typecheck**

Run: `cd frontend && npx tsc --noEmit 2>&1 | grep -E "administradores|sidebar"`
Expected: sin salida.

- [ ] **Step 4: Rebuild del contenedor frontend y levantar todo**

Run:
```bash
docker compose build frontend-app
docker compose up -d
docker compose ps --format "table {{.Name}}\t{{.Status}}"
```
Expected: los 6 contenedores (`itec-mysql`, `itec-backend`, `itec-ms-asistencias`, `itec-ms-notas`, `itec-api-gateway`, `itec-frontend`) en estado `Up`/`healthy`.

- [ ] **Step 5: Verificación manual E2E con curl (sin tests de controller en el repo, ver Global Constraints)**

```bash
# 1. Login como ADMIN existente para obtener el token
TOKEN=$(curl -s -X POST http://localhost:8080/api/core/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"<usuario_admin_existente>","password":"<password>"}' | jq -r '.data[0].token')

# 2. Crear un administrativo nuevo
curl -s -X POST http://localhost:8080/api/core/administradores \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"nombre":"Test","apellido":"Admin","dni":"30999888","email":"test.admin@itec.edu.ar","telefono":"3760001111","rol":"ADMINISTRATIVO"}'
# Expected: 201, data[0] con username="30999888", enabled=true, rol="ADMINISTRATIVO"

# 3. Listar (debe incluir el recien creado, y NO alumnos/profesores)
curl -s http://localhost:8080/api/core/administradores -H "Authorization: Bearer $TOKEN"

# 4. Editar (cambiar rol a ADMIN)
curl -s -X PUT http://localhost:8080/api/core/administradores/<id> \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"nombre":"Test","apellido":"Admin","email":"test.admin@itec.edu.ar","telefono":"3760001111","rol":"ADMIN","enabled":true}'
# Expected: 200, rol="ADMIN"

# 5. Resetear password
curl -s -X POST http://localhost:8080/api/core/administradores/<id>/reset-password -H "Authorization: Bearer $TOKEN"
# Expected: 200

# 6. Auto-bloqueo: intentar deshabilitarse a si mismo (usar el <id> del usuario logueado con $TOKEN)
curl -s -X PUT http://localhost:8080/api/core/administradores/<id_propio> \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"nombre":"...","apellido":"...","email":"...","telefono":"...","rol":"ADMIN","enabled":false}'
# Expected: 400, errors[0].description = "No podés deshabilitarte o cambiar tu propio rol"
```

- [ ] **Step 6: Verificación manual en navegador**

1. Abrir `http://localhost:3000/login`, loguearse como ADMIN.
2. Confirmar que "Administradores" aparece en el sidebar.
3. Entrar a `/dashboard/administradores`, crear un administrativo nuevo desde el formulario, confirmar toast de éxito y que aparece en la tabla.
4. Editarlo: cambiar rol a ADMIN, confirmar que el badge de la tabla se actualiza.
5. Resetear su contraseña, confirmar toast.
6. Abrir el formulario de edición de la fila del propio usuario logueado y confirmar que los botones de rol y "Inactivo" aparecen deshabilitados con el texto de ayuda.

- [ ] **Step 7: Commit**

```bash
git add frontend/app/dashboard/administradores/page.tsx frontend/components/layout/sidebar.tsx
git commit -m "feat(frontend): pantalla /dashboard/administradores y entrada en sidebar"
```

---

## Self-Review

**1. Cobertura del spec:**
- CRUD completo (crear/listar/editar/deshabilitar) → Tasks 3-4 (backend), 5-7 (frontend). ✓
- Password auto = DNI → Task 3 (`crear`/`resetPassword`). ✓
- Acceso solo ADMIN → `@PreAuthorize("hasRole('ADMIN')")` en los 4 endpoints (Task 4) + `roles: ["ADMIN"]` en sidebar (Task 7). ✓
- Filtro de listado solo ADMIN/ADMINISTRATIVO → `findByRolesIn` (Task 1) + `ROLES_GESTIONABLES` (Task 3). ✓
- Campos editables (rol, contacto, estado, reset password) → `ActualizarAdministradorRequest` + endpoint reset-password (Tasks 1, 3, 4). ✓
- Auto-bloqueo → `SelfActionNotAllowedException` + tests dedicados (Task 2, 3) + UI deshabilitada (Task 6). ✓

**2. Placeholders:** ninguno — todos los steps tienen código completo, comandos exactos con output esperado.

**3. Consistencia de tipos:** `UsuarioAdminResponse`/`Administrador` usan los mismos nombres de campo en las 3 capas (`rol`, `enabled`, `dni`, etc.); `CrearAdministradorRequest`/`CrearAdministradorInput` y `ActualizarAdministradorRequest`/`ActualizarAdministradorInput` alineados campo a campo entre backend y frontend.
