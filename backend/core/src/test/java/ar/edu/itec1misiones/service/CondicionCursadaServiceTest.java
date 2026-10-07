package ar.edu.itec1misiones.service;

import ar.edu.itec1misiones.client.AsistenciasClient;
import ar.edu.itec1misiones.client.NotasClient;
import ar.edu.itec1misiones.dto.response.CalificacionParcialDto;
import ar.edu.itec1misiones.dto.response.CondicionPreviewResponse;
import ar.edu.itec1misiones.dto.response.ResumenAsistenciaDto;
import ar.edu.itec1misiones.model.*;
import ar.edu.itec1misiones.repository.CursadaRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CondicionCursadaServiceTest {

    @Mock
    private CursadaRepository cursadaRepository;
    @Mock
    private NotasClient notasClient;
    @Mock
    private AsistenciasClient asistenciasClient;

    @InjectMocks
    private CondicionCursadaService service;

    private Cursada cursadaCon(ModalidadEvaluacion modalidad) {
        MateriaPlan materiaPlan = MateriaPlan.builder().id(1L).modalidadEvaluacion(modalidad).build();
        Comision comision = Comision.builder().id(9L).materiaPlan(materiaPlan).build();
        return Cursada.builder().id(100L).comision(comision).build();
    }

    // Los casos de parciales asumen asistencia REGULAR (80 %); los casos de
    // asistencia pisan este stub.
    @BeforeEach
    void asistenciaRegularPorDefecto() {
        lenient().when(asistenciasClient.obtenerResumen(100L)).thenReturn(resumen(8, 10, "REGULAR"));
    }

    private ResumenAsistenciaDto resumen(int asistidas, int total, String estado) {
        Double porcentaje = total == 0 ? null : asistidas * 100.0 / total;
        return new ResumenAsistenciaDto(100L, asistidas, 0, total - asistidas, total, porcentaje, estado);
    }

    private CalificacionParcialDto parcial(double nota) {
        return new CalificacionParcialDto(null, 100L, 9L, "Parcial", nota, LocalDate.now());
    }

    @Test
    void promedioMenorA4EsLibre() {
        when(cursadaRepository.findById(100L)).thenReturn(Optional.of(cursadaCon(ModalidadEvaluacion.FINAL)));
        when(notasClient.obtenerPorCursada(100L)).thenReturn(List.of(parcial(2.0), parcial(3.0), parcial(3.0)));

        CondicionPreviewResponse resultado = service.calcular(100L);

        assertEquals(CondicionFinal.LIBRE, resultado.getCondicionFinal());
    }

    @Test
    void promedioEntre4y7EsRegular() {
        when(cursadaRepository.findById(100L)).thenReturn(Optional.of(cursadaCon(ModalidadEvaluacion.FINAL)));
        when(notasClient.obtenerPorCursada(100L)).thenReturn(List.of(parcial(5.0), parcial(6.0), parcial(5.0)));

        CondicionPreviewResponse resultado = service.calcular(100L);

        assertEquals(CondicionFinal.REGULAR, resultado.getCondicionFinal());
    }

    @Test
    void promedioMayorIgualA7PromocionalPromociona() {
        when(cursadaRepository.findById(100L)).thenReturn(Optional.of(cursadaCon(ModalidadEvaluacion.PROMOCIONAL)));
        when(notasClient.obtenerPorCursada(100L)).thenReturn(List.of(parcial(8.0), parcial(9.0), parcial(7.0)));

        CondicionPreviewResponse resultado = service.calcular(100L);

        assertEquals(CondicionFinal.PROMOCIONADA, resultado.getCondicionFinal());
        assertEquals(8.0, resultado.getNotaCierre());
    }

    @Test
    void promedioMayorIgualA7ModalidadFinalNuncaPromociona() {
        when(cursadaRepository.findById(100L)).thenReturn(Optional.of(cursadaCon(ModalidadEvaluacion.FINAL)));
        when(notasClient.obtenerPorCursada(100L)).thenReturn(List.of(parcial(8.0), parcial(9.0), parcial(7.0)));

        CondicionPreviewResponse resultado = service.calcular(100L);

        assertEquals(CondicionFinal.REGULAR, resultado.getCondicionFinal());
    }

    @Test
    void faltanParcialesTira400() {
        when(cursadaRepository.findById(100L)).thenReturn(Optional.of(cursadaCon(ModalidadEvaluacion.FINAL)));
        when(notasClient.obtenerPorCursada(100L)).thenReturn(List.of(parcial(5.0)));

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> service.calcular(100L));
        assertEquals(400, ex.getStatusCode().value());
    }

    @Test
    void calcular_noRegularQuedaLibreAunConPromedioAlto() {
        when(cursadaRepository.findById(100L)).thenReturn(Optional.of(cursadaCon(ModalidadEvaluacion.PROMOCIONAL)));
        when(asistenciasClient.obtenerResumen(100L)).thenReturn(resumen(6, 10, "NO_REGULAR"));
        when(notasClient.obtenerPorCursada(100L)).thenReturn(List.of(parcial(9.0), parcial(9.0), parcial(9.0)));

        CondicionPreviewResponse resultado = service.calcular(100L);

        assertEquals(CondicionFinal.LIBRE, resultado.getCondicionFinal());
        assertEquals("ASISTENCIA", resultado.getMotivoLibre());
        assertEquals(9.0, resultado.getPromedioParciales());
    }

    @Test
    void calcular_noRegularQuedaLibreAunSinParciales() {
        when(cursadaRepository.findById(100L)).thenReturn(Optional.of(cursadaCon(ModalidadEvaluacion.FINAL)));
        when(asistenciasClient.obtenerResumen(100L)).thenReturn(resumen(2, 10, "NO_REGULAR"));
        when(notasClient.obtenerPorCursada(100L)).thenReturn(List.of(parcial(5.0)));

        CondicionPreviewResponse resultado = service.calcular(100L);

        assertEquals(CondicionFinal.LIBRE, resultado.getCondicionFinal());
        assertEquals("ASISTENCIA", resultado.getMotivoLibre());
        assertNull(resultado.getPromedioParciales());
    }

    @Test
    void calcular_regularSigueReglaDeParciales() {
        when(cursadaRepository.findById(100L)).thenReturn(Optional.of(cursadaCon(ModalidadEvaluacion.PROMOCIONAL)));
        when(notasClient.obtenerPorCursada(100L)).thenReturn(List.of(parcial(8.0), parcial(8.0), parcial(8.0)));

        CondicionPreviewResponse resultado = service.calcular(100L);

        assertEquals(CondicionFinal.PROMOCIONADA, resultado.getCondicionFinal());
        assertNull(resultado.getMotivoLibre());
    }

    @Test
    void calcular_informaPorcentajeYMotivoLibre() {
        when(cursadaRepository.findById(100L)).thenReturn(Optional.of(cursadaCon(ModalidadEvaluacion.FINAL)));
        when(notasClient.obtenerPorCursada(100L)).thenReturn(List.of(parcial(2.0), parcial(3.0), parcial(3.0)));

        CondicionPreviewResponse resultado = service.calcular(100L);

        assertEquals(80.0, resultado.getPorcentajeAsistencia());
        assertEquals("REGULAR", resultado.getEstadoAsistencia());
        assertEquals("PROMEDIO", resultado.getMotivoLibre());
    }

    @Test
    void calcular_sinRegistrosRechazaCierre() {
        when(cursadaRepository.findById(100L)).thenReturn(Optional.of(cursadaCon(ModalidadEvaluacion.FINAL)));
        when(asistenciasClient.obtenerResumen(100L)).thenReturn(resumen(0, 0, "SIN_REGISTROS"));

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> service.calcular(100L));

        assertEquals(400, ex.getStatusCode().value());
        assertEquals("No hay asistencias registradas para este alumno en la comisión", ex.getReason());
        verify(notasClient, never()).obtenerPorCursada(100L);
    }

    @Test
    void calcular_siFallaElServicioDeAsistenciasDevuelve503() {
        when(cursadaRepository.findById(100L)).thenReturn(Optional.of(cursadaCon(ModalidadEvaluacion.FINAL)));
        when(asistenciasClient.obtenerResumen(100L)).thenThrow(
                new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "No se pudieron obtener las asistencias. Intentá más tarde."));

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> service.calcular(100L));

        assertEquals(503, ex.getStatusCode().value());
    }

    @Test
    void cerrar_cursadaYaCerradaDevuelve409() {
        Cursada cerrada = cursadaCon(ModalidadEvaluacion.FINAL);
        cerrada.setCondicionFinal(CondicionFinal.REGULAR);
        when(cursadaRepository.findById(100L)).thenReturn(Optional.of(cerrada));

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> service.cerrar(100L));

        assertEquals(409, ex.getStatusCode().value());
        assertEquals("La cursada ya está cerrada", ex.getReason());
        assertEquals(CondicionFinal.REGULAR, cerrada.getCondicionFinal());
    }
}
