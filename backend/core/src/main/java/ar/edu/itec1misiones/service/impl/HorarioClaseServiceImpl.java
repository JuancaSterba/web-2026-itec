package ar.edu.itec1misiones.service.impl;

import ar.edu.itec1misiones.dto.request.HorarioClaseRequest;
import ar.edu.itec1misiones.dto.response.HorarioClaseResponse;
import ar.edu.itec1misiones.dto.response.ModuloHorarioResponse;
import ar.edu.itec1misiones.exception.ComisionNotFoundException;
import ar.edu.itec1misiones.exception.HorarioClaseNotFoundException;
import ar.edu.itec1misiones.exception.ModuloHorarioNotFoundException;
import ar.edu.itec1misiones.model.ComisionMateria;
import ar.edu.itec1misiones.model.HorarioClase;
import ar.edu.itec1misiones.model.ModuloHorario;
import ar.edu.itec1misiones.repository.ComisionMateriaRepository;
import ar.edu.itec1misiones.repository.HorarioClaseRepository;
import ar.edu.itec1misiones.repository.ModuloHorarioRepository;
import ar.edu.itec1misiones.service.HorarioClaseService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
public class HorarioClaseServiceImpl implements HorarioClaseService {

    private final HorarioClaseRepository horarioClaseRepository;
    private final ComisionMateriaRepository comisionMateriaRepository;
    private final ModuloHorarioRepository moduloHorarioRepository;

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
        return toResponse(horarioClaseRepository.save(horario));
    }

    @Override
    public HorarioClaseResponse update(Long id, HorarioClaseRequest request) {
        HorarioClase horario = horarioClaseRepository.findById(id)
                .orElseThrow(() -> new HorarioClaseNotFoundException(id));
        mapFromRequest(horario, request);
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
        if (!comisionMateriaRepository.existsById(comisionId)) {
            throw new ComisionNotFoundException(comisionId);
        }
        return horarioClaseRepository.findByComisionId(comisionId).stream()
                .map(this::toResponse)
                .toList();
    }

    private void mapFromRequest(HorarioClase horario, HorarioClaseRequest request) {
        ComisionMateria comision = comisionMateriaRepository.findById(request.getComisionId())
                .orElseThrow(() -> new ComisionNotFoundException(request.getComisionId()));

        List<ModuloHorario> modulos = request.getModulosIds().stream()
                .map(moduloId -> moduloHorarioRepository.findById(moduloId)
                        .orElseThrow(() -> new ModuloHorarioNotFoundException(moduloId)))
                .toList();

        horario.setDiaSemana(request.getDiaSemana());
        horario.setComision(comision);
        horario.setModulos(modulos);
    }

    private HorarioClaseResponse toResponse(HorarioClase horario) {
        List<ModuloHorarioResponse> modulosResponse = horario.getModulos().stream()
                .map(m -> ModuloHorarioResponse.builder()
                        .id(m.getId())
                        .numero(m.getNumero())
                        .horaInicio(m.getHoraInicio())
                        .horaFin(m.getHoraFin())
                        .build())
                .toList();

        return HorarioClaseResponse.builder()
                .id(horario.getId())
                .diaSemana(horario.getDiaSemana())
                .comisionId(horario.getComision().getId())
                .materiaNombre(horario.getComision().getMateria().getNombre())
                .modulos(modulosResponse)
                .build();
    }
}
