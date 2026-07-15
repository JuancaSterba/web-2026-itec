package ar.edu.itec1misiones.exception;

import ar.edu.itec1misiones.dto.ApiResponse;
import ar.edu.itec1misiones.dto.ErrorDto;
import ar.edu.itec1misiones.dto.response.MetaBuilderHelper;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

// @Order(HIGHEST_PRECEDENCE): garantiza que estos handlers especificos se
// evaluen ANTES que el catch-all de Exception.class en SecurityExceptionHandler
// (sin esto, ambos @ControllerAdvice quedan en el mismo orden por defecto y
// el catch-all puede ganar el empate, devolviendo 500 en vez del status real).
@Order(Ordered.HIGHEST_PRECEDENCE)
@ControllerAdvice
public class CoreExceptionHandler {

    @ExceptionHandler(CarreraNotFoundException.class)
    public ResponseEntity<ApiResponse<Object>> handleCarreraNotFound(
            CarreraNotFoundException ex,
            HttpServletRequest request) {

        ErrorDto error = new ErrorDto("CARRERA_NOT_FOUND", ex.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                ApiResponse.builder()
                        .meta(MetaBuilderHelper.buildMeta(request))
                        .errors(List.of(error))
                        .build()
        );
    }

    @ExceptionHandler(PlanEstudioNotFoundException.class)
    public ResponseEntity<ApiResponse<Object>> handlePlanEstudioNotFound(
            PlanEstudioNotFoundException ex,
            HttpServletRequest request) {

        ErrorDto error = new ErrorDto("PLAN_ESTUDIO_NOT_FOUND", ex.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                ApiResponse.builder()
                        .meta(MetaBuilderHelper.buildMeta(request))
                        .errors(List.of(error))
                        .build()
        );
    }

    @ExceptionHandler(MateriaNotFoundException.class)
    public ResponseEntity<ApiResponse<Object>> handleMateriaNotFound(
            MateriaNotFoundException ex,
            HttpServletRequest request) {

        ErrorDto error = new ErrorDto("MATERIA_NOT_FOUND", ex.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                ApiResponse.builder()
                        .meta(MetaBuilderHelper.buildMeta(request))
                        .errors(List.of(error))
                        .build()
        );
    }

    @ExceptionHandler(ComisionNotFoundException.class)
    public ResponseEntity<ApiResponse<Object>> handleComisionNotFound(
            ComisionNotFoundException ex,
            HttpServletRequest request) {

        ErrorDto error = new ErrorDto("COMISION_NOT_FOUND", ex.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                ApiResponse.builder()
                        .meta(MetaBuilderHelper.buildMeta(request))
                        .errors(List.of(error))
                        .build()
        );
    }

    @ExceptionHandler(CicloLectivoNotFoundException.class)
    public ResponseEntity<ApiResponse<Object>> handleCicloLectivoNotFound(
            CicloLectivoNotFoundException ex,
            HttpServletRequest request) {

        ErrorDto error = new ErrorDto("CICLO_LECTIVO_NOT_FOUND", ex.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                ApiResponse.builder()
                        .meta(MetaBuilderHelper.buildMeta(request))
                        .errors(List.of(error))
                        .build()
        );
    }

    @ExceptionHandler(PeriodoAcademicoNotFoundException.class)
    public ResponseEntity<ApiResponse<Object>> handlePeriodoAcademicoNotFound(
            PeriodoAcademicoNotFoundException ex,
            HttpServletRequest request) {

        ErrorDto error = new ErrorDto("PERIODO_ACADEMICO_NOT_FOUND", ex.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                ApiResponse.builder()
                        .meta(MetaBuilderHelper.buildMeta(request))
                        .errors(List.of(error))
                        .build()
        );
    }

    @ExceptionHandler(InscripcionCarreraNotFoundException.class)
    public ResponseEntity<ApiResponse<Object>> handleInscripcionCarreraNotFound(
            InscripcionCarreraNotFoundException ex,
            HttpServletRequest request) {

        ErrorDto error = new ErrorDto("INSCRIPCION_CARRERA_NOT_FOUND", ex.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                ApiResponse.builder()
                        .meta(MetaBuilderHelper.buildMeta(request))
                        .errors(List.of(error))
                        .build()
        );
    }

    @ExceptionHandler(MesaExamenNotFoundException.class)
    public ResponseEntity<ApiResponse<Object>> handleMesaExamenNotFound(
            MesaExamenNotFoundException ex,
            HttpServletRequest request) {

        ErrorDto error = new ErrorDto("MESA_EXAMEN_NOT_FOUND", ex.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                ApiResponse.builder()
                        .meta(MetaBuilderHelper.buildMeta(request))
                        .errors(List.of(error))
                        .build()
        );
    }

    @ExceptionHandler(AlumnoYaInscriptoEnMesaException.class)
    public ResponseEntity<ApiResponse<Object>> handleAlumnoYaInscriptoEnMesa(
            AlumnoYaInscriptoEnMesaException ex,
            HttpServletRequest request) {

        ErrorDto error = new ErrorDto("ALUMNO_YA_INSCRIPTO_MESA", ex.getMessage());
        return ResponseEntity.status(HttpStatus.CONFLICT).body(
                ApiResponse.builder()
                        .meta(MetaBuilderHelper.buildMeta(request))
                        .errors(List.of(error))
                        .build()
        );
    }

    @ExceptionHandler(CursadaNotFoundException.class)
    public ResponseEntity<ApiResponse<Object>> handleCursadaNotFound(
            CursadaNotFoundException ex,
            HttpServletRequest request) {

        ErrorDto error = new ErrorDto("CURSADA_NOT_FOUND", ex.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                ApiResponse.builder()
                        .meta(MetaBuilderHelper.buildMeta(request))
                        .errors(List.of(error))
                        .build()
        );
    }

    @ExceptionHandler(ComisionProfesorNotFoundException.class)
    public ResponseEntity<ApiResponse<Object>> handleComisionProfesorNotFound(
            ComisionProfesorNotFoundException ex,
            HttpServletRequest request) {

        ErrorDto error = new ErrorDto("COMISION_PROFESOR_NOT_FOUND", ex.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                ApiResponse.builder()
                        .meta(MetaBuilderHelper.buildMeta(request))
                        .errors(List.of(error))
                        .build()
        );
    }

    @ExceptionHandler(MateriaPlanNotFoundException.class)
    public ResponseEntity<ApiResponse<Object>> handleMateriaPlanNotFound(
            MateriaPlanNotFoundException ex,
            HttpServletRequest request) {

        ErrorDto error = new ErrorDto("MATERIA_PLAN_NOT_FOUND", ex.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                ApiResponse.builder()
                        .meta(MetaBuilderHelper.buildMeta(request))
                        .errors(List.of(error))
                        .build()
        );
    }

    @ExceptionHandler(ProfesorNotFoundException.class)
    public ResponseEntity<ApiResponse<Object>> handleProfesorNotFound(
            ProfesorNotFoundException ex,
            HttpServletRequest request) {

        ErrorDto error = new ErrorDto("PROFESOR_NOT_FOUND", ex.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                ApiResponse.builder()
                        .meta(MetaBuilderHelper.buildMeta(request))
                        .errors(List.of(error))
                        .build()
        );
    }

    @ExceptionHandler(AlumnoNotFoundException.class)
    public ResponseEntity<ApiResponse<Object>> handleAlumnoNotFound(
            AlumnoNotFoundException ex,
            HttpServletRequest request) {

        ErrorDto error = new ErrorDto("ALUMNO_NOT_FOUND", ex.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                ApiResponse.builder()
                        .meta(MetaBuilderHelper.buildMeta(request))
                        .errors(List.of(error))
                        .build()
        );
    }

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

    @ExceptionHandler(AlumnoYaInscriptoEnCarreraException.class)
    public ResponseEntity<ApiResponse<Object>> handleAlumnoYaInscriptoEnCarrera(
            AlumnoYaInscriptoEnCarreraException ex,
            HttpServletRequest request) {

        ErrorDto error = new ErrorDto("ALUMNO_YA_INSCRIPTO_CARRERA", ex.getMessage());
        return ResponseEntity.status(HttpStatus.CONFLICT).body(
                ApiResponse.builder()
                        .meta(MetaBuilderHelper.buildMeta(request))
                        .errors(List.of(error))
                        .build()
        );
    }

    @ExceptionHandler(AlumnoYaInscriptoEnComisionException.class)
    public ResponseEntity<ApiResponse<Object>> handleAlumnoYaInscriptoEnComision(
            AlumnoYaInscriptoEnComisionException ex,
            HttpServletRequest request) {

        ErrorDto error = new ErrorDto("ALUMNO_YA_INSCRIPTO_COMISION", ex.getMessage());
        return ResponseEntity.status(HttpStatus.CONFLICT).body(
                ApiResponse.builder()
                        .meta(MetaBuilderHelper.buildMeta(request))
                        .errors(List.of(error))
                        .build()
        );
    }

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<ApiResponse<Object>> handleResponseStatus(
            ResponseStatusException ex,
            HttpServletRequest request) {

        ErrorDto error = new ErrorDto("CONDICION_ERROR", ex.getReason());
        return ResponseEntity.status(ex.getStatusCode()).body(
                ApiResponse.builder()
                        .meta(MetaBuilderHelper.buildMeta(request))
                        .errors(List.of(error))
                        .build()
        );
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiResponse<Object>> handleIllegalArgument(
            IllegalArgumentException ex,
            HttpServletRequest request) {

        ErrorDto error = new ErrorDto("INVALID_ARGUMENT", ex.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                ApiResponse.builder()
                        .meta(MetaBuilderHelper.buildMeta(request))
                        .errors(List.of(error))
                        .build()
        );
    }

}
