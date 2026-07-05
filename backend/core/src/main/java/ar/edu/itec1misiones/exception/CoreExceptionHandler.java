package ar.edu.itec1misiones.exception;

import ar.edu.itec1misiones.dto.ApiResponse;
import ar.edu.itec1misiones.dto.ErrorDto;
import ar.edu.itec1misiones.dto.response.MetaBuilderHelper;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.util.List;

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

    @ExceptionHandler(CuatrimestreNotFoundException.class)
    public ResponseEntity<ApiResponse<Object>> handleCuatrimestreNotFound(
            CuatrimestreNotFoundException ex,
            HttpServletRequest request) {

        ErrorDto error = new ErrorDto("CUATRIMESTRE_NOT_FOUND", ex.getMessage());
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

    @ExceptionHandler(AlumnoInscriptoNotFoundException.class)
    public ResponseEntity<ApiResponse<Object>> handleAlumnoInscriptoNotFound(
            AlumnoInscriptoNotFoundException ex,
            HttpServletRequest request) {

        ErrorDto error = new ErrorDto("ALUMNO_INSCRIPTO_NOT_FOUND", ex.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                ApiResponse.builder()
                        .meta(MetaBuilderHelper.buildMeta(request))
                        .errors(List.of(error))
                        .build()
        );
    }

    @ExceptionHandler(AlumnoYaInscriptoEnMateriaException.class)
    public ResponseEntity<ApiResponse<Object>> handleAlumnoYaInscriptoEnMateria(
            AlumnoYaInscriptoEnMateriaException ex,
            HttpServletRequest request) {

        ErrorDto error = new ErrorDto("ALUMNO_YA_INSCRIPTO_EN_MATERIA", ex.getMessage());
        return ResponseEntity.status(HttpStatus.CONFLICT).body(
                ApiResponse.builder()
                        .meta(MetaBuilderHelper.buildMeta(request))
                        .errors(List.of(error))
                        .build()
        );
    }

    @ExceptionHandler(ComisionInactivaException.class)
    public ResponseEntity<ApiResponse<Object>> handleComisionInactiva(
            ComisionInactivaException ex,
            HttpServletRequest request) {

        ErrorDto error = new ErrorDto("COMISION_INACTIVA", ex.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                ApiResponse.builder()
                        .meta(MetaBuilderHelper.buildMeta(request))
                        .errors(List.of(error))
                        .build()
        );
    }

    @ExceptionHandler(CupoComisionLlenoException.class)
    public ResponseEntity<ApiResponse<Object>> handleCupoComisionLleno(
            CupoComisionLlenoException ex,
            HttpServletRequest request) {

        ErrorDto error = new ErrorDto("CUPO_COMISION_LLENO", ex.getMessage());
        return ResponseEntity.status(HttpStatus.CONFLICT).body(
                ApiResponse.builder()
                        .meta(MetaBuilderHelper.buildMeta(request))
                        .errors(List.of(error))
                        .build()
        );
    }
}
