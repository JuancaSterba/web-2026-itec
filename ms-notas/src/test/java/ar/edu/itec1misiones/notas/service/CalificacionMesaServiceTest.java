package ar.edu.itec1misiones.notas.service;

import ar.edu.itec1misiones.notas.dto.CalificacionMesaRequest;
import ar.edu.itec1misiones.notas.model.CalificacionMesa;
import ar.edu.itec1misiones.notas.repository.CalificacionMesaRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CalificacionMesaServiceTest {

    @Mock
    private CalificacionMesaRepository repository;

    @InjectMocks
    private CalificacionMesaService service;

    private CalificacionMesaRequest request(Long mesaId, Long alumnoId, Double nota) {
        CalificacionMesaRequest r = new CalificacionMesaRequest();
        r.setMesaExamenId(mesaId);
        r.setAlumnoId(alumnoId);
        r.setNota(nota);
        return r;
    }

    @Test
    void crearPersisteLaNotaDeLaMesa() {
        when(repository.existsByMesaExamenIdAndAlumnoId(50L, 30L)).thenReturn(false);
        when(repository.save(any(CalificacionMesa.class))).thenAnswer(inv -> inv.getArgument(0));

        CalificacionMesa resultado = service.crear(request(50L, 30L, 7.0));

        assertEquals(50L, resultado.getMesaExamenId());
        assertEquals(30L, resultado.getAlumnoId());
        assertEquals(7.0, resultado.getNota());
        assertFalse(resultado.getAusente());
    }

    @Test
    void crearAusenteSinNotaEsValido() {
        when(repository.existsByMesaExamenIdAndAlumnoId(50L, 30L)).thenReturn(false);
        when(repository.save(any(CalificacionMesa.class))).thenAnswer(inv -> inv.getArgument(0));

        CalificacionMesaRequest r = request(50L, 30L, null);
        r.setAusente(true);

        CalificacionMesa resultado = service.crear(r);

        assertNull(resultado.getNota());
        assertEquals(true, resultado.getAusente());
    }

    @Test
    void crearDuplicadoEnLaMismaMesaDevuelve409() {
        when(repository.existsByMesaExamenIdAndAlumnoId(50L, 30L)).thenReturn(true);

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> service.crear(request(50L, 30L, 7.0)));

        assertEquals(409, ex.getStatusCode().value());
        verify(repository, never()).save(any());
    }

    @Test
    void actualizarModificaNotaYActa() {
        CalificacionMesa existente = new CalificacionMesa(7L, 50L, 30L, null, true, null, null);
        when(repository.findById(7L)).thenReturn(Optional.of(existente));
        when(repository.save(any(CalificacionMesa.class))).thenAnswer(inv -> inv.getArgument(0));

        CalificacionMesaRequest r = request(50L, 30L, 9.0);
        r.setLibro("L1");
        r.setFolio("F42");

        CalificacionMesa resultado = service.actualizar(7L, r);

        assertEquals(9.0, resultado.getNota());
        assertFalse(resultado.getAusente());
        assertEquals("L1", resultado.getLibro());
        assertEquals("F42", resultado.getFolio());
    }

    @Test
    void actualizarInexistenteDevuelve404() {
        when(repository.findById(99L)).thenReturn(Optional.empty());

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> service.actualizar(99L, request(50L, 30L, 7.0)));

        assertEquals(404, ex.getStatusCode().value());
    }
}
