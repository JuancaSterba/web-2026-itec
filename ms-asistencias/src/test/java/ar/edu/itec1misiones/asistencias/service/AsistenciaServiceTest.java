package ar.edu.itec1misiones.asistencias.service;

import ar.edu.itec1misiones.asistencias.client.HorarioClient;
import ar.edu.itec1misiones.asistencias.dto.AsistenciaRequest;
import ar.edu.itec1misiones.asistencias.dto.EstadoRegularidad;
import ar.edu.itec1misiones.asistencias.dto.ResumenAsistenciaResponse;
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
import java.util.List;
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

    private Asistencia asistencia(Long cursadaId, LocalDate fecha, String estado) {
        return new Asistencia(null, cursadaId, 9L, fecha, estado);
    }

    @Test
    void resumir_cuentaSoloLasFechasConMarcaDelAlumno() {
        // La comision tuvo 4 clases; la cursada 2 se inscribio tarde y solo
        // tiene marca en las ultimas 2. Esas son su total (RF-03).
        when(repository.findByCursadaIdIn(List.of(1L, 2L))).thenReturn(List.of(
                asistencia(1L, LocalDate.of(2026, 3, 2), "PRESENTE"),
                asistencia(1L, LocalDate.of(2026, 3, 9), "AUSENTE"),
                asistencia(1L, LocalDate.of(2026, 3, 16), "AUSENTE"),
                asistencia(1L, LocalDate.of(2026, 3, 23), "PRESENTE"),
                asistencia(2L, LocalDate.of(2026, 3, 16), "PRESENTE"),
                asistencia(2L, LocalDate.of(2026, 3, 23), "TARDANZA")));

        List<ResumenAsistenciaResponse> resumenes = service.resumir(List.of(1L, 2L));

        assertEquals(2, resumenes.size());
        ResumenAsistenciaResponse inscriptoTarde = resumenes.get(1);
        assertEquals(2L, inscriptoTarde.getCursadaId());
        assertEquals(2, inscriptoTarde.getTotalClases());
        assertEquals(EstadoRegularidad.REGULAR, inscriptoTarde.getEstado());
        assertEquals(EstadoRegularidad.NO_REGULAR, resumenes.get(0).getEstado());
    }

    @Test
    void resumir_cursadaSinFilasDevuelveSinRegistros() {
        when(repository.findByCursadaIdIn(List.of(1L, 3L))).thenReturn(List.of(
                asistencia(1L, LocalDate.of(2026, 3, 2), "PRESENTE")));

        List<ResumenAsistenciaResponse> resumenes = service.resumir(List.of(1L, 3L));

        assertEquals(2, resumenes.size());
        assertEquals(3L, resumenes.get(1).getCursadaId());
        assertEquals(EstadoRegularidad.SIN_REGISTROS, resumenes.get(1).getEstado());
    }
}
