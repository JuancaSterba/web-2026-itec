package ar.edu.itec1misiones.service;

import ar.edu.itec1misiones.dto.request.PlanEstudioRequest;
import ar.edu.itec1misiones.dto.response.PlanEstudioResponse;

import java.util.List;

public interface PlanEstudioService {
    PlanEstudioResponse crear(PlanEstudioRequest request);
    List<PlanEstudioResponse> listarActivos();
    List<PlanEstudioResponse> listarActivosPorCarrera(Long carreraId);
    PlanEstudioResponse buscarPorId(Long id);
    PlanEstudioResponse actualizar(Long id, PlanEstudioRequest request);
    void desactivar(Long id);
}
