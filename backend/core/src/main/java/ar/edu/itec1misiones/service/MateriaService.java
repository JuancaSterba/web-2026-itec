package ar.edu.itec1misiones.service;

import ar.edu.itec1misiones.dto.request.MateriaRequest;
import ar.edu.itec1misiones.dto.response.MateriaResponse;

import java.util.List;

public interface MateriaService {
    MateriaResponse crear(MateriaRequest request);
    List<MateriaResponse> listarActivas();
    List<MateriaResponse> listarActivasPorPlan(Long planEstudioId);
    MateriaResponse buscarPorId(Long id);
    MateriaResponse actualizar(Long id, MateriaRequest request);
    void desactivar(Long id);
    MateriaResponse asignarCorrelativas(Long materiaId, List<Long> correlativasIds);
    MateriaResponse eliminarCorrelativa(Long materiaId, Long correlativaId);
}
