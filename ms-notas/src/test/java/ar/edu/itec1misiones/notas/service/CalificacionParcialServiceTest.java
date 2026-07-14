package ar.edu.itec1misiones.notas.service;

import ar.edu.itec1misiones.notas.client.HorarioClient;
import ar.edu.itec1misiones.notas.dto.CalificacionParcialRequest;
import ar.edu.itec1misiones.notas.model.CalificacionParcial;
import ar.edu.itec1misiones.notas.repository.CalificacionParcialRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CalificacionParcialServiceTest {

    @Mock
    private CalificacionParcialRepository repository;

    @Mock
    private HorarioClient horarioClient;

    @InjectMocks
    private CalificacionParcialService service;

    @BeforeEach
    void setUp() {
        org.mockito.Mockito.lenient()
            .when(horarioClient.diasDeClase(1L))
            .thenReturn(java.util.Set.of(java.time.DayOfWeek.values()));
    }

    private CalificacionParcialRequest requestParcial(long cursadaId) {
        CalificacionParcialRequest r = new CalificacionParcialRequest();
        r.setCursadaId(cursadaId);
        r.setComisionId(1L);
        r.setInstancia("Primer Parcial");
        r.setNota(8.0);
        r.setFecha(LocalDate.now());
        return r;
    }

    @Test
    void rechazaElCuartoParcialDeLaMismaCursada() {
        when(repository.countByCursadaId(1L)).thenReturn(3L);

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> service.crear(requestParcial(1L)));

        assertEquals(400, ex.getStatusCode().value());
    }

    @Test
    void permiteElTercerParcial() {
        when(repository.countByCursadaId(1L)).thenReturn(2L);
        when(repository.save(any(CalificacionParcial.class))).thenAnswer(inv -> inv.getArgument(0));

        CalificacionParcial resultado = service.crear(requestParcial(1L));

        assertEquals("Primer Parcial", resultado.getInstancia());
        assertEquals(8.0, resultado.getNota());
    }

    @Test
    void rechazaParcialConFechaQueNoEsDiaDeClase() {
        HorarioClient horarioClient = org.mockito.Mockito.mock(HorarioClient.class);
        when(horarioClient.diasDeClase(1L)).thenReturn(java.util.Set.of(java.time.DayOfWeek.MONDAY));

        CalificacionParcialService servicioConHorario =
                new CalificacionParcialService(repository, horarioClient);

        CalificacionParcialRequest r = requestParcial(1L);
        r.setFecha(java.time.LocalDate.of(2026, 7, 9)); // jueves

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> servicioConHorario.crear(r));
        assertEquals(400, ex.getStatusCode().value());
    }

    @Test
    void permiteParcialConFechaQueSiEsDiaDeClase() {
        HorarioClient horarioClient = org.mockito.Mockito.mock(HorarioClient.class);
        when(horarioClient.diasDeClase(1L)).thenReturn(java.util.Set.of(java.time.DayOfWeek.THURSDAY));
        when(repository.save(any(CalificacionParcial.class))).thenAnswer(inv -> inv.getArgument(0));

        CalificacionParcialService servicioConHorario =
                new CalificacionParcialService(repository, horarioClient);

        CalificacionParcialRequest r = requestParcial(1L);
        r.setFecha(java.time.LocalDate.of(2026, 7, 9)); // jueves

        assertDoesNotThrow(() -> servicioConHorario.crear(r));
    }
}
