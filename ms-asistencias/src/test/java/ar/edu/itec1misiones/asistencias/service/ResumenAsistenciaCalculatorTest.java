package ar.edu.itec1misiones.asistencias.service;

import ar.edu.itec1misiones.asistencias.dto.EstadoRegularidad;
import ar.edu.itec1misiones.asistencias.dto.ResumenAsistenciaResponse;
import org.junit.jupiter.api.Test;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

class ResumenAsistenciaCalculatorTest {

    private List<String> estados(int presentes, int tardanzas, int ausentes) {
        List<String> estados = new ArrayList<>();
        estados.addAll(Collections.nCopies(presentes, "PRESENTE"));
        estados.addAll(Collections.nCopies(tardanzas, "TARDANZA"));
        estados.addAll(Collections.nCopies(ausentes, "AUSENTE"));
        return estados;
    }

    @Test
    void cuentaTardanzasComoPresentes() {
        ResumenAsistenciaResponse resumen = ResumenAsistenciaCalculator.resumir(1L, estados(5, 2, 3));

        assertEquals(5, resumen.getPresentes());
        assertEquals(2, resumen.getTardanzas());
        assertEquals(3, resumen.getAusentes());
        assertEquals(70.0, resumen.getPorcentaje(), 0.0001);
        assertEquals(EstadoRegularidad.REGULAR, resumen.getEstado());
    }

    @Test
    void cuentaElValorViejoTardeComoTardanza() {
        ResumenAsistenciaResponse resumen = ResumenAsistenciaCalculator.resumir(1L, List.of("TARDE", "AUSENTE"));

        assertEquals(1, resumen.getTardanzas());
        assertEquals(50.0, resumen.getPorcentaje(), 0.0001);
    }

    @Test
    void calculaPorcentajeSobreClasesConMarca() {
        ResumenAsistenciaResponse resumen = ResumenAsistenciaCalculator.resumir(1L, estados(3, 0, 1));

        assertEquals(4, resumen.getTotalClases());
        assertEquals(75.0, resumen.getPorcentaje(), 0.0001);
        assertEquals(1L, resumen.getCursadaId());
    }

    @Test
    void setentaExactoEsRegular() {
        ResumenAsistenciaResponse resumen = ResumenAsistenciaCalculator.resumir(1L, estados(7, 0, 3));

        assertEquals(EstadoRegularidad.REGULAR, resumen.getEstado());
    }

    @Test
    void sesentaYNueveConNueveEsNoRegular() {
        ResumenAsistenciaResponse resumen = ResumenAsistenciaCalculator.resumir(1L, estados(699, 0, 301));

        assertEquals(EstadoRegularidad.NO_REGULAR, resumen.getEstado());
    }

    @Test
    void sinMarcasEsSinRegistros() {
        ResumenAsistenciaResponse resumen = ResumenAsistenciaCalculator.resumir(1L, List.of());

        assertEquals(0, resumen.getTotalClases());
        assertNull(resumen.getPorcentaje());
        assertEquals(EstadoRegularidad.SIN_REGISTROS, resumen.getEstado());
    }
}
