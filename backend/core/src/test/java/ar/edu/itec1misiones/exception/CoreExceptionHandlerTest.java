package ar.edu.itec1misiones.exception;

import ar.edu.itec1misiones.dto.ApiResponse;
import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

class CoreExceptionHandlerTest {

    private CoreExceptionHandler handler;
    private HttpServletRequest request;

    @BeforeEach
    void setUp() {
        handler = new CoreExceptionHandler();
        request = Mockito.mock(HttpServletRequest.class);
        Mockito.when(request.getRequestURI()).thenReturn("/api/mesas-examen/1/inscribir");
    }

    @Test
    void handleMateriaYaAprobada_devuelve409Conflict() {
        MateriaYaAprobadaException ex = new MateriaYaAprobadaException("El alumno ya aprobó la materia con nota 8");
        ResponseEntity<ApiResponse<Object>> response = handler.handleMateriaYaAprobada(ex, request);

        assertEquals(HttpStatus.CONFLICT, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("MATERIA_YA_APROBADA", response.getBody().getErrors().get(0).getCode());
        assertEquals("El alumno ya aprobó la materia con nota 8", response.getBody().getErrors().get(0).getDescription());
    }

    @Test
    void handleInscripcionMesaCerrada_devuelve400BadRequest() {
        InscripcionMesaCerradaException ex = new InscripcionMesaCerradaException("La inscripción cierra 48hs antes del examen");
        ResponseEntity<ApiResponse<Object>> response = handler.handleInscripcionMesaCerrada(ex, request);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("INSCRIPCION_MESA_CERRADA", response.getBody().getErrors().get(0).getCode());
        assertEquals("La inscripción cierra 48hs antes del examen", response.getBody().getErrors().get(0).getDescription());
    }
}
