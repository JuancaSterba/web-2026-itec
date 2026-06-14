# Diagrama de Secuencia: Registro de Asistencias

Este diagrama ilustra el flujo específico para el registro de asistencias por parte de un docente. Contempla la interacción con el **Microservicio de Asistencias** y la lógica de negocio para el cálculo del 70% de presentismo (que puede derivar en la pérdida de la regularidad del alumno).

```mermaid
sequenceDiagram
    autonumber
    actor Docente
    participant Frontend as Frontend (Cliente)
    participant MS_Asistencias as Microservicio Asistencias
    participant Core as App Principal (Core)
    participant DB as Base de Datos

    Docente->>Frontend: Carga planilla de asistencia (Comisión, Fecha, Alumnos Presentes/Ausentes)
    Frontend->>MS_Asistencias: POST /api/v1/asistencias (Lista de registros)
    
    activate MS_Asistencias
    MS_Asistencias->>MS_Asistencias: Valida Token JWT y Permisos (Rol DOC)
    
    %% Guardado de la asistencia
    MS_Asistencias->>DB: Guarda los registros en tabla ASISTENCIAS (INSERT)
    activate DB
    DB-->>MS_Asistencias: OK
    deactivate DB
    
    %% Validación de Regla de Negocio (70% de asistencia)
    MS_Asistencias->>DB: Consulta cantidad de clases totales dictadas y presentes por alumno
    activate DB
    DB-->>MS_Asistencias: Retorna porcentajes de asistencia por alumno
    deactivate DB
    
    loop Por cada Alumno procesado
        MS_Asistencias->>MS_Asistencias: Verifica si % Asistencia < 70%
        
        alt Pierde la Regularidad (Asistencia < 70%)
            Note over MS_Asistencias, Core: Al compartir base de datos, el MS_Asistencias<br>podría actualizar el estado directamente,<br>o delegar al Core la lógica del cambio de estado.
            MS_Asistencias->>Core: POST /api/v1/inscripciones/{id}/estado (Libre)
            activate Core
            Core->>DB: UPDATE alumnos_inscriptos SET estado = 'Libre'
            activate DB
            DB-->>Core: OK
            deactivate DB
            Core-->>MS_Asistencias: Confirmación de actualización
            deactivate Core
        end
    end

    MS_Asistencias-->>Frontend: HTTP 201 Created / 200 OK (Asistencia guardada)
    deactivate MS_Asistencias
    Frontend-->>Docente: Muestra mensaje de éxito (Planilla guardada)
```

### 💡 Consideraciones y Reglas de Negocio a tener en cuenta:

1. **Responsabilidad del Microservicio:** Según la arquitectura, el microservicio de Asistencias recibe el flujo pesado del alta de asistencias.
2. **Cálculo de Totales:** Para poder calcular si un alumno quedó por debajo del 70%, el sistema primero debe poder saber la *cantidad total de clases que han transcurrido* para esa comisión hasta la fecha, y contrastarlo con las presencias del alumno.
3. **Comunicación Interservicio vs Base de Datos Compartida:** 
   - Como la arquitectura define un monolito de base de datos compartida ("Contenedor Base de Datos"), el MS_Asistencias podría teóricamente hacer el `UPDATE` directo del estado. 
   - Sin embargo, **por buenas prácticas de diseño**, se suele representar (como se hizo aquí) que el encargado de modificar la inscripción (estado académico) es la *App Principal (Core)*. Por ello, el microservicio se comunica con el Core para notificar la baja a "Libre".
4. **Fechas Hábiles / Feriados:** El sistema debería contemplar o que el docente registre las clases una por una en los días que correspondan, para no contar días sin clases dentro del total para el cálculo del porcentaje.
