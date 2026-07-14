package ar.edu.itec1misiones.service;

import ar.edu.itec1misiones.client.NotasClient;
import ar.edu.itec1misiones.dto.response.CalificacionParcialDto;
import ar.edu.itec1misiones.dto.response.CondicionPreviewResponse;
import ar.edu.itec1misiones.model.*;
import ar.edu.itec1misiones.repository.CursadaRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CondicionCursadaServiceTest {

    @Mock
    private CursadaRepository cursadaRepository;
    @Mock
    private NotasClient notasClient;

    @InjectMocks
    private CondicionCursadaService service;

    private Cursada cursadaCon(ModalidadEvaluacion modalidad) {
        MateriaPlan materiaPlan = MateriaPlan.builder().id(1L).modalidadEvaluacion(modalidad).build();
        Comision comision = Comision.builder().id(9L).materiaPlan(materiaPlan).build();
        return Cursada.builder().id(100L).comision(comision).build();
    }

    private CalificacionParcialDto parcial(double nota) {
        return new CalificacionParcialDto(null, 100L, 9L, "Parcial", nota, LocalDate.now(), "PARCIAL");
    }

    private CalificacionParcialDto finalDto(double nota, LocalDate fecha) {
        return new CalificacionParcialDto(null, 100L, 9L, "Final", nota, fecha, "FINAL");
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
    void notasDeTipoFinalSonIgnoradasEnLaCursada() {
        when(cursadaRepository.findById(100L)).thenReturn(Optional.of(cursadaCon(ModalidadEvaluacion.FINAL)));
        when(notasClient.obtenerPorCursada(100L)).thenReturn(List.of(
                parcial(5.0), parcial(5.0), parcial(5.0),
                finalDto(9.0, LocalDate.now())));

        CondicionPreviewResponse resultado = service.calcular(100L);

        assertEquals(CondicionFinal.REGULAR, resultado.getCondicionFinal());
        assertEquals(5.0, resultado.getNotaCierre());
    }

    @Test
    void faltanParcialesTira400() {
        when(cursadaRepository.findById(100L)).thenReturn(Optional.of(cursadaCon(ModalidadEvaluacion.FINAL)));
        when(notasClient.obtenerPorCursada(100L)).thenReturn(List.of(parcial(5.0)));

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> service.calcular(100L));
        assertEquals(400, ex.getStatusCode().value());
    }
}
