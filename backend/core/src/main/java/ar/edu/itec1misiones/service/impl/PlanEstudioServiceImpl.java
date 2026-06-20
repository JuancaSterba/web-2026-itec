package ar.edu.itec1misiones.service.impl;

import ar.edu.itec1misiones.dto.request.PlanEstudioRequest;
import ar.edu.itec1misiones.dto.response.PlanEstudioResponse;
import ar.edu.itec1misiones.exception.CarreraNotFoundException;
import ar.edu.itec1misiones.exception.PlanEstudioNotFoundException;
import ar.edu.itec1misiones.model.Carrera;
import ar.edu.itec1misiones.model.PlanEstudio;
import ar.edu.itec1misiones.repository.CarreraRepository;
import ar.edu.itec1misiones.repository.PlanEstudioRepository;
import ar.edu.itec1misiones.service.PlanEstudioService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PlanEstudioServiceImpl implements PlanEstudioService {

    private final PlanEstudioRepository planEstudioRepository;
    private final CarreraRepository carreraRepository;

    public PlanEstudioServiceImpl(PlanEstudioRepository planEstudioRepository,
                                  CarreraRepository carreraRepository) {
        this.planEstudioRepository = planEstudioRepository;
        this.carreraRepository = carreraRepository;
    }

    @Override
    public PlanEstudioResponse crear(PlanEstudioRequest request) {
        Carrera carrera = carreraRepository.findById(request.getCarreraId())
                .orElseThrow(() -> new CarreraNotFoundException(request.getCarreraId()));

        PlanEstudio plan = new PlanEstudio();
        plan.setValidez(request.getValidez());
        plan.setResolucion(request.getResolucion());
        plan.setFechaInicio(request.getFechaInicio());
        plan.setFechaFin(request.getFechaFin());
        plan.setCarrera(carrera);
        plan.setActivo(true);

        return toResponse(planEstudioRepository.save(plan));
    }

    @Override
    public List<PlanEstudioResponse> listarActivos() {
        return planEstudioRepository.findByActivoTrue().stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public List<PlanEstudioResponse> listarActivosPorCarrera(Long carreraId) {
        carreraRepository.findById(carreraId)
                .orElseThrow(() -> new CarreraNotFoundException(carreraId));
        return planEstudioRepository.findByCarreraIdAndActivoTrue(carreraId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public PlanEstudioResponse buscarPorId(Long id) {
        return toResponse(planEstudioRepository.findById(id)
                .orElseThrow(() -> new PlanEstudioNotFoundException(id)));
    }

    @Override
    public PlanEstudioResponse actualizar(Long id, PlanEstudioRequest request) {
        PlanEstudio plan = planEstudioRepository.findById(id)
                .orElseThrow(() -> new PlanEstudioNotFoundException(id));

        Carrera carrera = carreraRepository.findById(request.getCarreraId())
                .orElseThrow(() -> new CarreraNotFoundException(request.getCarreraId()));

        plan.setValidez(request.getValidez());
        plan.setResolucion(request.getResolucion());
        plan.setFechaInicio(request.getFechaInicio());
        plan.setFechaFin(request.getFechaFin());
        plan.setCarrera(carrera);

        return toResponse(planEstudioRepository.save(plan));
    }

    @Override
    public void desactivar(Long id) {
        PlanEstudio plan = planEstudioRepository.findById(id)
                .orElseThrow(() -> new PlanEstudioNotFoundException(id));
        plan.setActivo(false);
        planEstudioRepository.save(plan);
    }

    private PlanEstudioResponse toResponse(PlanEstudio plan) {
        return PlanEstudioResponse.builder()
                .id(plan.getId())
                .validez(plan.getValidez())
                .resolucion(plan.getResolucion())
                .fechaInicio(plan.getFechaInicio())
                .fechaFin(plan.getFechaFin())
                .activo(plan.isActivo())
                .carreraId(plan.getCarrera().getId())
                .carreraNombre(plan.getCarrera().getNombre())
                .build();
    }
}
