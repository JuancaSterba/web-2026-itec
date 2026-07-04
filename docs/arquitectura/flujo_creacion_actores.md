# Flujo de Creación de Actores (Alumnos / Profesores)

Este diagrama de secuencia ilustra la regla de negocio para la creación de actores en el sistema. Dado que el sistema actualmente es de uso exclusivo para personal administrativo, la creación de un `Alumno` o `Profesor` genera automáticamente un `Usuario` subyacente con credenciales derivadas de su DNI.

```mermaid
sequenceDiagram
    participant Admin as Administrador (UI)
    participant Gateway as API Gateway
    participant CoreController as Alumno/Profesor Controller
    participant CoreService as Alumno/Profesor Service
    participant UserRepo as Usuario Repository
    participant ActorRepo as Alumno/Profesor Repository

    Admin->>Gateway: POST /api/core/alumnos <br/> {nombre, apellido, dni, email, legajo}
    Gateway->>CoreController: Rutea petición (inyecta X-User-Id)
    CoreController->>CoreService: crearAlumno(dto)
    
    rect rgb(240, 248, 255)
    Note over CoreService,UserRepo: 1. Creación Automática de Identidad
    CoreService->>CoreService: Genera username = DNI
    CoreService->>CoreService: Genera password = BCrypt(DNI)
    CoreService->>UserRepo: save(Usuario con Rol ALUMNO)
    UserRepo-->>CoreService: Retorna Usuario (con nuevo ID)
    end
    
    rect rgb(230, 255, 230)
    Note over CoreService,ActorRepo: 2. Creación del Actor
    CoreService->>ActorRepo: save(Alumno vinculado al nuevo Usuario ID)
    ActorRepo-->>CoreService: Retorna Alumno
    end
    
    CoreService-->>CoreController: 201 Created (AlumnoDTO)
    CoreController-->>Gateway: 201 Created
    Gateway-->>Admin: Muestra Toast de Éxito en UI
```

### Reglas Clave:
- El Frontend envía un solo formulario.
- La transacción es atómica a nivel de base de datos en el backend (`@Transactional` en el Service). Si falla la creación del Alumno, se hace rollback del Usuario.
