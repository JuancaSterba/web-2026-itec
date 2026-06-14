package ar.edu.itec1misiones.security.exception;

import ar.edu.itec1misiones.dto.ApiResponse;
import ar.edu.itec1misiones.dto.ErrorDto;
import ar.edu.itec1misiones.dto.Meta;
import ar.edu.itec1misiones.dto.response.MetaBuilderHelper;
import ar.edu.itec1misiones.security.constants.ExceptionConstants;
import ar.edu.itec1misiones.security.constants.SecurityConstants;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@ControllerAdvice
public class SecurityExceptionHandler {

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ApiResponse<Object>> handleBadCredentials(
            BadCredentialsException ex,
            HttpServletRequest request) {

        ErrorDto errorDto = new ErrorDto(ExceptionConstants.ERROR_AUTH, ExceptionConstants.MSG_CREDENTIALS_INVALID);

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                ApiResponse.builder()
                        .meta(new Meta(request.getMethod(), request.getRequestURI()))
                        .errors(List.of(errorDto))
                        .build()
        );
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Object>> handleValidationErrors(
            MethodArgumentNotValidException ex,
            HttpServletRequest request) {

        List<ErrorDto> errorDtos = ex.getBindingResult().getFieldErrors().stream()
                .map(err -> new ErrorDto(err.getField(), err.getDefaultMessage()))
                .collect(Collectors.toList());

        return ResponseEntity.badRequest().body(
                ApiResponse.builder()
                        .meta(new Meta(request.getMethod(), request.getRequestURI()))
                        .errors(errorDtos)
                        .build()
        );
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Object>> handleGenericException(
            Exception ex,
            HttpServletRequest request) {

        ErrorDto error = new ErrorDto(ExceptionConstants.ERROR_INTERNAL, ex.getMessage());

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                ApiResponse.builder()
                        .meta(MetaBuilderHelper.buildMeta(request)) // Usás el helper
                        .errors(List.of(error))
                        .build()
        );
    }

    @ExceptionHandler(UserExistException.class)
    public ResponseEntity<ApiResponse<Object>> handleUsuarioYaExiste(
            UserExistException ex,
            HttpServletRequest request) {

        ErrorDto errorDto = new ErrorDto(ExceptionConstants.ERROR_USER_ALREADY_EXISTS, ex.getMessage());

        return ResponseEntity.status(HttpStatus.CONFLICT).body(
                ApiResponse.builder()
                        .meta(MetaBuilderHelper.buildMeta(request))
                        .errors(List.of(errorDto))
                        .build()
        );
    }
    @ExceptionHandler(DataExistException.class)
    public ResponseEntity<ApiResponse<Object>> handleDatoYaExiste(
            DataExistException ex,
            HttpServletRequest request) {

        ErrorDto error = new ErrorDto(ExceptionConstants.ERROR_DUPLICATED_FIELD, ex.getMessage());

        return ResponseEntity.status(HttpStatus.CONFLICT).body(
                ApiResponse.builder()
                        .meta(MetaBuilderHelper.buildMeta(request))
                        .errors(List.of(error))
                        .build()
        );
    }

    @ExceptionHandler(MultiDataExistException.class)
    public ResponseEntity<ApiResponse<Void>> handleMultiplesDatos(MultiDataExistException ex) {
        List<ErrorDto> errores = ex.getErrors().stream()
                .map(msg -> new ErrorDto(ExceptionConstants.ERROR_DUPLICATED_FIELD, msg))
                .collect(Collectors.toList());

        ApiResponse<Void> response = ApiResponse.<Void>builder()
                .meta(new Meta("POST", SecurityConstants.AUTH_BASE_PATH+SecurityConstants.REGISTER_PATH))
                .data(Collections.emptyList())
                .errors(errores)
                .build();

        return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
    }

    @ExceptionHandler(jakarta.validation.ConstraintViolationException.class)
    public ResponseEntity<ApiResponse<Object>> handleConstraintViolation(
            jakarta.validation.ConstraintViolationException ex,
            HttpServletRequest request) {

        List<ErrorDto> errorDtos = ex.getConstraintViolations().stream()
                .map(cv -> new ErrorDto("CONSTRAINT_VIOLATION", cv.getPropertyPath() + ": " + cv.getMessage()))
                .collect(Collectors.toList());

        return ResponseEntity.badRequest().body(
                ApiResponse.builder()
                        .meta(new Meta(request.getMethod(), request.getRequestURI()))
                        .errors(errorDtos)
                        .build()
        );
    }
    @ExceptionHandler(org.springframework.security.access.AccessDeniedException.class)
    public ResponseEntity<ApiResponse<Object>> handleAccessDeniedException(
            org.springframework.security.access.AccessDeniedException ex,
            HttpServletRequest request) {

        ErrorDto error = new ErrorDto("ACCESS_DENIED", ex.getMessage());

        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(
                ApiResponse.builder()
                        .meta(MetaBuilderHelper.buildMeta(request))
                        .errors(List.of(error))
                        .build()
        );
    }
}
