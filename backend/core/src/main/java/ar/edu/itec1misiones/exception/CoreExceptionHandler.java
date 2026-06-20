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
