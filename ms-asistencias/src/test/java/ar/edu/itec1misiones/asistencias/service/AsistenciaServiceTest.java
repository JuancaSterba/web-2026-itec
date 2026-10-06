package ar.edu.itec1misiones.asistencias.service;

import ar.edu.itec1misiones.asistencias.client.HorarioClient;
import ar.edu.itec1misiones.asistencias.dto.AsistenciaRequest;
import ar.edu.itec1misiones.asistencias.model.Asistencia;
import ar.edu.itec1misiones.asistencias.repository.AsistenciaRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AsistenciaServiceTest {

    @Mock
    private AsistenciaRepository repository;

    @Mock
    private HorarioClient horarioClient;

    @InjectMocks
    private AsistenciaService service;

    @BeforeEach
    void setUp() {
        lenient().when(horarioClient.diasDeClase(anyLong())).thenReturn(Set.of(DayOfWeek.values()));
    }

    @Test
    void creaAsistenciaConComisionId() {
        when(repository.save(any(Asistencia.class))).thenAnswer(inv -> inv.getArgument(0));

        AsistenciaRequest request = new AsistenciaRequest();
        request.setCursadaId(1L);
        request.setComisionId(9L);
        request.setFecha(LocalDate.now());
        request.setEstado("PRESENTE");

        Asistencia resultado = service.crear(request);

        assertEquals(9L, resultado.getComisionId());
    }

    @Test
    void rechazaAsistenciaConFechaQueNoEsDiaDeClase() {
        HorarioClient horarioClientPropio = org.mockito.Mockito.mock(HorarioClient.class);
        when(horarioClientPropio.diasDeClase(9L)).thenReturn(Set.of(DayOfWeek.MONDAY));

        AsistenciaService servicioConHorario = new AsistenciaService(repository, horarioClientPropio);

        AsistenciaRequest request = new AsistenciaRequest();
        request.setCursadaId(1L);
        request.setComisionId(9L);
        request.setFecha(LocalDate.of(2026, 7, 9)); // jueves
        request.setEstado("PRESENTE");

        org.springframework.web.server.ResponseStatusException ex = org.junit.jupiter.api.Assertions.assertThrows(
                org.springframework.web.server.ResponseStatusException.class,
                () -> servicioConHorario.crear(request));
        assertEquals(400, ex.getStatusCode().value());
    }

    @Test
    void permiteAsistenciaConFechaQueSiEsDiaDeClase() {
        HorarioClient horarioClientPropio = org.mockito.Mockito.mock(HorarioClient.class);
        when(horarioClientPropio.diasDeClase(9L)).thenReturn(Set.of(DayOfWeek.THURSDAY));
        when(repository.save(any(Asistencia.class))).thenAnswer(inv -> inv.getArgument(0));

        AsistenciaService servicioConHorario = new AsistenciaService(repository, horarioClientPropio);

        AsistenciaRequest request = new AsistenciaRequest();
        request.setCursadaId(1L);
        request.setComisionId(9L);
        request.setFecha(LocalDate.of(2026, 7, 9)); // jueves
        request.setEstado("PRESENTE");

        org.junit.jupiter.api.Assertions.assertDoesNotThrow(() -> servicioConHorario.crear(request));
    }
}
