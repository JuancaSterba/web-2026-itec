package ar.edu.itec1misiones.service.impl;

import ar.edu.itec1misiones.dto.request.MateriaRequest;
import ar.edu.itec1misiones.dto.response.MateriaResponse;
import ar.edu.itec1misiones.exception.MateriaNotFoundException;
import ar.edu.itec1misiones.exception.PlanEstudioNotFoundException;
import ar.edu.itec1misiones.model.Materia;
import ar.edu.itec1misiones.model.PlanEstudio;
import ar.edu.itec1misiones.repository.MateriaRepository;
import ar.edu.itec1misiones.repository.PlanEstudioRepository;
import ar.edu.itec1misiones.service.MateriaService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@Transactional
public class MateriaServiceImpl implements MateriaService {

    private final MateriaRepository materiaRepository;
    private final PlanEstudioRepository planEstudioRepository;

    public MateriaServiceImpl(MateriaRepository materiaRepository,
                              PlanEstudioRepository planEstudioRepository) {
        this.materiaRepository = materiaRepository;
        this.planEstudioRepository = planEstudioRepository;
    }

    @Override
    public MateriaResponse crear(MateriaRequest request) {
        PlanEstudio plan = planEstudioRepository.findById(request.getPlanEstudioId())
                .orElseThrow(() -> new PlanEstudioNotFoundException(request.getPlanEstudioId()));

        Materia materia = new Materia();
        materia.setNombre(request.getNombre());
        materia.setCargaHoraria(request.getCargaHoraria());
        materia.setAnio(request.getAnio());
        materia.setCuatrimestre(request.getCuatrimestre());
        materia.setPlanEstudio(plan);
        materia.setActiva(true);

        return toResponse(materiaRepository.save(materia));
    }

    @Override
    public List<MateriaResponse> listarActivas() {
        return materiaRepository.findByActivaTrue().stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public List<MateriaResponse> listarActivasPorPlan(Long planEstudioId) {
        planEstudioRepository.findById(planEstudioId)
                .orElseThrow(() -> new PlanEstudioNotFoundException(planEstudioId));
        return materiaRepository.findByPlanEstudioIdAndActivaTrue(planEstudioId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public MateriaResponse buscarPorId(Long id) {
        return toResponse(materiaRepository.findById(id)
                .orElseThrow(() -> new MateriaNotFoundException(id)));
    }

    @Override
    public MateriaResponse actualizar(Long id, MateriaRequest request) {
        Materia materia = materiaRepository.findById(id)
                .orElseThrow(() -> new MateriaNotFoundException(id));

        PlanEstudio plan = planEstudioRepository.findById(request.getPlanEstudioId())
                .orElseThrow(() -> new PlanEstudioNotFoundException(request.getPlanEstudioId()));

        materia.setNombre(request.getNombre());
        materia.setCargaHoraria(request.getCargaHoraria());
        materia.setAnio(request.getAnio());
        materia.setCuatrimestre(request.getCuatrimestre());
        materia.setPlanEstudio(plan);

        return toResponse(materiaRepository.save(materia));
    }

    @Override
    public void desactivar(Long id) {
        Materia materia = materiaRepository.findById(id)
                .orElseThrow(() -> new MateriaNotFoundException(id));
        materia.setActiva(false);
        materiaRepository.save(materia);
    }

    @Override
    public MateriaResponse asignarCorrelativas(Long materiaId, List<Long> correlativasIds) {
        Materia materia = materiaRepository.findById(materiaId)
                .orElseThrow(() -> new MateriaNotFoundException(materiaId));

        List<Materia> correlativas = correlativasIds.stream()
                .map(cId -> {
                    Materia correlativa = materiaRepository.findById(cId)
                            .orElseThrow(() -> new MateriaNotFoundException(cId));
                    if (!correlativa.getPlanEstudio().getId().equals(materia.getPlanEstudio().getId())) {
                        throw new IllegalArgumentException(
                                "La correlativa con id " + cId + " no pertenece al mismo Plan de Estudio");
                    }
                    return correlativa;
                })
                .toList();

        materia.setCorrelativas(new ArrayList<>(correlativas));
        return toResponse(materiaRepository.save(materia));
    }

    @Override
    public MateriaResponse eliminarCorrelativa(Long materiaId, Long correlativaId) {
        Materia materia = materiaRepository.findById(materiaId)
                .orElseThrow(() -> new MateriaNotFoundException(materiaId));
        materia.getCorrelativas().removeIf(c -> c.getId().equals(correlativaId));
        return toResponse(materiaRepository.save(materia));
    }

    private MateriaResponse toResponse(Materia materia) {
        return MateriaResponse.builder()
                .id(materia.getId())
                .nombre(materia.getNombre())
                .cargaHoraria(materia.getCargaHoraria())
                .anio(materia.getAnio())
                .cuatrimestre(materia.getCuatrimestre())
                .activa(materia.isActiva())
                .planEstudioId(materia.getPlanEstudio().getId())
                .planEstudioValidez(materia.getPlanEstudio().getValidez())
                .correlativasIds(materia.getCorrelativas().stream().map(Materia::getId).toList())
                .build();
    }
}
