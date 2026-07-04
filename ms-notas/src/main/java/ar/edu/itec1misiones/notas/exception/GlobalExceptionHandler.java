package ar.edu.itec1misiones.notas.exception;

import ar.edu.itec1misiones.dto.ApiResponse;
import ar.edu.itec1misiones.dto.ErrorDto;
import ar.edu.itec1misiones.dto.response.MetaBuilderHelper;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Mismo contrato de respuesta que el Core (ApiResponse/ErrorDto/Meta de
 * backend/commons), ver docs/deuda_tecnica.md #2.
 */
@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Object>> handleValidation(
            MethodArgumentNotValidException ex,
            HttpServletRequest request) {

        List<ErrorDto> errores = ex.getBindingResult().getFieldErrors().stream()
                .map(err -> new ErrorDto(err.getField(), err.getDefaultMessage()))
                .collect(Collectors.toList());

        return ResponseEntity.badRequest().body(
                ApiResponse.builder()
                        .meta(MetaBuilderHelper.buildMeta(request))
                        .errors(errores)
                        .build()
        );
    }

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<ApiResponse<Object>> handleResponseStatus(
            ResponseStatusException ex,
            HttpServletRequest request) {

        ErrorDto error = new ErrorDto("NOTA_ERROR", ex.getReason());
        return ResponseEntity.status(ex.getStatusCode()).body(
                ApiResponse.builder()
                        .meta(MetaBuilderHelper.buildMeta(request))
                        .errors(List.of(error))
                        .build()
        );
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Object>> handleGeneric(
            Exception ex,
            HttpServletRequest request) {

        ErrorDto error = new ErrorDto("INTERNAL_ERROR", ex.getMessage());
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                ApiResponse.builder()
                        .meta(MetaBuilderHelper.buildMeta(request))
                        .errors(List.of(error))
                        .build()
        );
    }
}
