package ar.edu.itec1misiones.service.impl;

import org.junit.jupiter.api.Test;

import java.time.DayOfWeek;
import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.assertEquals;

class HorarioClaseServiceImplTest {

    @Test
    void devuelveHoySiElDiaSemanaCoincideConHoy() {
        LocalDate hoy = LocalDate.of(2026, 7, 9); // jueves
        LocalDate proxima = HorarioClaseServiceImpl.calcularProximaFecha(DayOfWeek.THURSDAY, hoy);
        assertEquals(hoy, proxima);
    }

    @Test
    void devuelveLaProximaOcurrenciaDentroDeLaSemana() {
        LocalDate hoy = LocalDate.of(2026, 7, 9); // jueves
        LocalDate proxima = HorarioClaseServiceImpl.calcularProximaFecha(DayOfWeek.SATURDAY, hoy);
        assertEquals(LocalDate.of(2026, 7, 11), proxima);
    }

    @Test
    void envuelveALaSemanaSiguienteSiElDiaYaPaso() {
        LocalDate hoy = LocalDate.of(2026, 7, 9); // jueves
        LocalDate proxima = HorarioClaseServiceImpl.calcularProximaFecha(DayOfWeek.MONDAY, hoy);
        assertEquals(LocalDate.of(2026, 7, 13), proxima);
    }

    @Test
    void funcionaParaCadaDiaDeLaSemana() {
        LocalDate hoy = LocalDate.of(2026, 7, 9); // jueves
        for (DayOfWeek dia : DayOfWeek.values()) {
            LocalDate proxima = HorarioClaseServiceImpl.calcularProximaFecha(dia, hoy);
            assertEquals(dia, proxima.getDayOfWeek());
            assertEquals(true, !proxima.isBefore(hoy) && !proxima.isAfter(hoy.plusDays(6)));
        }
    }
}
