package ar.edu.itec1misiones.service.impl;

import ar.edu.itec1misiones.dto.request.HorarioClaseRequest;
import ar.edu.itec1misiones.dto.response.HorarioClaseResponse;
import ar.edu.itec1misiones.exception.ComisionNotFoundException;
import ar.edu.itec1misiones.exception.HorarioClaseNotFoundException;
import ar.edu.itec1misiones.model.Comision;
import ar.edu.itec1misiones.model.HorarioClase;
import ar.edu.itec1misiones.repository.ComisionRepository;
import ar.edu.itec1misiones.repository.HorarioClaseRepository;
import ar.edu.itec1misiones.service.HorarioClaseService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
public class HorarioClaseServiceImpl implements HorarioClaseService {

    private final HorarioClaseRepository horarioClaseRepository;
    private final ComisionRepository comisionRepository;

    @Override
    @Transactional(readOnly = true)
    public List<HorarioClaseResponse> getAll() {
        return horarioClaseRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public HorarioClaseResponse getById(Long id) {
        return toResponse(horarioClaseRepository.findById(id)
                .orElseThrow(() -> new HorarioClaseNotFoundException(id)));
    }

    @Override
    public HorarioClaseResponse create(HorarioClaseRequest request) {
        HorarioClase horario = new HorarioClase();
        mapFromRequest(horario, request);
        validarCargaHoraria(horario.getComision(), horario);
        return toResponse(horarioClaseRepository.save(horario));
    }

    @Override
    public HorarioClaseResponse update(Long id, HorarioClaseRequest request) {
        HorarioClase horario = horarioClaseRepository.findById(id)
                .orElseThrow(() -> new HorarioClaseNotFoundException(id));
        mapFromRequest(horario, request);
        validarCargaHoraria(horario.getComision(), horario);
        return toResponse(horarioClaseRepository.save(horario));
    }

    @Override
    public void delete(Long id) {
        if (!horarioClaseRepository.existsById(id)) {
            throw new HorarioClaseNotFoundException(id);
        }
        horarioClaseRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<HorarioClaseResponse> getByComisionId(Long comisionId) {
        if (!comisionRepository.existsById(comisionId)) {
            throw new ComisionNotFoundException(comisionId);
        }
        return horarioClaseRepository.findByComisionId(comisionId).stream()
                .map(this::toResponse)
                .toList();
    }

    private void mapFromRequest(HorarioClase horario, HorarioClaseRequest request) {
        Comision comision = comisionRepository.findById(request.getComisionId())
                .orElseThrow(() -> new ComisionNotFoundException(request.getComisionId()));

        horario.setDiaSemana(request.getDiaSemana());
        horario.setComision(comision);

        if (request.getHoraInicio() != null && request.getHoraFin() != null) {
            horario.setHoraInicio(request.getHoraInicio());
            horario.setHoraFin(request.getHoraFin());
        } else {
            throw new IllegalArgumentException("Debe proveer horaInicio y horaFin");
        }
    }

    private void validarCargaHoraria(Comision comision, HorarioClase horarioAdicional) {
        List<HorarioClase> existentes = horarioClaseRepository.findByComisionId(comision.getId());
        long minutosAsignados = existentes.stream()
                .filter(h -> horarioAdicional.getId() == null || !h.getId().equals(horarioAdicional.getId()))
                .mapToLong(this::calcularDuracionMinutos)
                .sum();
        
        long minutosNuevos = calcularDuracionMinutos(horarioAdicional);
        long minutosTotal = minutosAsignados + minutosNuevos;
        long maxMinutos = comision.getMateriaPlan().getCargaHoraria() * 60L;
        
        if (minutosTotal > maxMinutos) {
            throw new IllegalArgumentException("La suma de horas asignadas supera la carga horaria de la materia (" + comision.getMateriaPlan().getCargaHoraria() + " hs).");
        }
    }

    private long calcularDuracionMinutos(HorarioClase h) {
        if (h.getHoraInicio() != null && h.getHoraFin() != null) {
            return java.time.Duration.between(h.getHoraInicio(), h.getHoraFin()).toMinutes();
        }
        return 0;
    }

    private HorarioClaseResponse toResponse(HorarioClase horario) {
        return HorarioClaseResponse.builder()
                .id(horario.getId())
                .diaSemana(horario.getDiaSemana())
                .horaInicio(horario.getHoraInicio())
                .horaFin(horario.getHoraFin())
                .comisionId(horario.getComision().getId())
                .materiaNombre(horario.getComision().getMateriaPlan().getMateria().getNombre())
                .proximaFecha(calcularProximaFecha(horario.getDiaSemana(), LocalDate.now()))
                .build();
    }

    /**
     * Traduce el "dia de semana recurrente" del horario a la proxima fecha
     * concreta en que se dicta esa clase. Si hoy es el dia de la clase,
     * devuelve hoy (item 9 de PENDIENTES.md).
     */
    static LocalDate calcularProximaFecha(DayOfWeek diaSemana, LocalDate hoy) {
        int diasHastaProxima = diaSemana.getValue() - hoy.getDayOfWeek().getValue();
        if (diasHastaProxima < 0) {
            diasHastaProxima += 7;
        }
        return hoy.plusDays(diasHastaProxima);
    }
}
