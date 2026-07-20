package ar.edu.itec1misiones.service.impl;

import org.junit.jupiter.api.Test;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import ar.edu.itec1misiones.dto.request.HorarioClaseRequest;
import ar.edu.itec1misiones.model.Comision;
import ar.edu.itec1misiones.model.HorarioClase;
import ar.edu.itec1misiones.model.Materia;
import ar.edu.itec1misiones.model.MateriaPlan;
import ar.edu.itec1misiones.repository.ComisionRepository;
import ar.edu.itec1misiones.repository.HorarioClaseRepository;
import org.junit.jupiter.api.BeforeEach;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.when;

import static org.junit.jupiter.api.Assertions.assertEquals;

class HorarioClaseServiceImplTest {

    @Mock
    private HorarioClaseRepository horarioClaseRepository;
    @Mock
    private ComisionRepository comisionRepository;

    @InjectMocks
    private HorarioClaseServiceImpl horarioClaseService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

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
            assertEquals(true, !proxima.isBefore(hoy) && !proxima.isAfter(hoy.plusDays(6)));
        }
    }

    @Test
    void guardar_validaCargaHorariaExito() {
        Materia materia = new Materia();
        materia.setNombre("Programacion");
        
        MateriaPlan materiaPlan = new MateriaPlan();
        materiaPlan.setCargaHoraria(6); // 6 horas maximo
        materiaPlan.setMateria(materia);
        
        Comision comision = new Comision();
        comision.setId(1L);
        comision.setMateriaPlan(materiaPlan);

        HorarioClase existente = new HorarioClase();
        existente.setId(1L);
        existente.setHoraInicio(LocalTime.of(8, 0));
        existente.setHoraFin(LocalTime.of(10, 0)); // 2 horas

        when(comisionRepository.findById(1L)).thenReturn(Optional.of(comision));
        when(horarioClaseRepository.findByComisionId(1L)).thenReturn(List.of(existente));
        when(horarioClaseRepository.save(any())).thenAnswer(i -> {
            HorarioClase saved = i.getArgument(0);
            saved.setId(2L);
            return saved;
        });

        HorarioClaseRequest request = new HorarioClaseRequest();
        request.setComisionId(1L);
        request.setDiaSemana(DayOfWeek.TUESDAY);
        request.setHoraInicio(LocalTime.of(10, 0));
        request.setHoraFin(LocalTime.of(13, 0)); // 3 horas, total 5 hs (<= 6)

        // No lanza excepción
        horarioClaseService.create(request);
    }

    @Test
    void guardar_lanzaExcepcionSiSuperaCargaHoraria() {
        Materia materia = new Materia();
        materia.setNombre("Programacion");
        
        MateriaPlan materiaPlan = new MateriaPlan();
        materiaPlan.setCargaHoraria(4); // 4 horas maximo
        materiaPlan.setMateria(materia);
        
        Comision comision = new Comision();
        comision.setId(1L);
        comision.setMateriaPlan(materiaPlan);

        HorarioClase existente = new HorarioClase();
        existente.setId(1L);
        existente.setHoraInicio(LocalTime.of(8, 0));
        existente.setHoraFin(LocalTime.of(11, 0)); // 3 horas

        when(comisionRepository.findById(1L)).thenReturn(Optional.of(comision));
        when(horarioClaseRepository.findByComisionId(1L)).thenReturn(List.of(existente));

        HorarioClaseRequest request = new HorarioClaseRequest();
        request.setComisionId(1L);
        request.setDiaSemana(DayOfWeek.TUESDAY);
        request.setHoraInicio(LocalTime.of(10, 0));
        request.setHoraFin(LocalTime.of(12, 0)); // 2 horas, total 5 hs (> 4)

        assertThrows(IllegalArgumentException.class, () -> horarioClaseService.create(request));
    }
}
