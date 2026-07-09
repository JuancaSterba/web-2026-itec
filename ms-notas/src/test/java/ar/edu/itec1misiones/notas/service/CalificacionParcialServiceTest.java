package ar.edu.itec1misiones.notas.service;

import ar.edu.itec1misiones.notas.dto.CalificacionParcialRequest;
import ar.edu.itec1misiones.notas.model.CalificacionParcial;
import ar.edu.itec1misiones.notas.model.TipoInstancia;
import ar.edu.itec1misiones.notas.repository.CalificacionParcialRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CalificacionParcialServiceTest {

    @Mock
    private CalificacionParcialRepository repository;

    @InjectMocks
    private CalificacionParcialService service;

    private CalificacionParcialRequest requestParcial(long cursadaId) {
        CalificacionParcialRequest r = new CalificacionParcialRequest();
        r.setCursadaId(cursadaId);
        r.setComisionId(1L);
        r.setInstancia("Primer Parcial");
        r.setNota(8.0);
        r.setFecha(LocalDate.now());
        r.setTipo(TipoInstancia.PARCIAL);
        return r;
    }

    @Test
    void rechazaElCuartoParcialDeLaMismaCursada() {
        when(repository.countByCursadaIdAndTipo(1L, TipoInstancia.PARCIAL)).thenReturn(3L);

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> service.crear(requestParcial(1L)));

        assertEquals(400, ex.getStatusCode().value());
    }

    @Test
    void permiteElTercerParcial() {
        when(repository.countByCursadaIdAndTipo(1L, TipoInstancia.PARCIAL)).thenReturn(2L);
        when(repository.save(any(CalificacionParcial.class))).thenAnswer(inv -> inv.getArgument(0));

        CalificacionParcial resultado = service.crear(requestParcial(1L));

        assertEquals(TipoInstancia.PARCIAL, resultado.getTipo());
    }

    @Test
    void noLimitaLasNotasDeTipoFinal() {
        CalificacionParcialRequest r = requestParcial(1L);
        r.setTipo(TipoInstancia.FINAL);
        when(repository.save(any(CalificacionParcial.class))).thenAnswer(inv -> inv.getArgument(0));

        CalificacionParcial resultado = service.crear(r);

        assertEquals(TipoInstancia.FINAL, resultado.getTipo());
    }
}
