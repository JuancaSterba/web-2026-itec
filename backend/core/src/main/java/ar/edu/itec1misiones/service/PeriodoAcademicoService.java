package ar.edu.itec1misiones.service;

import ar.edu.itec1misiones.dto.request.PeriodoAcademicoRequest;
import ar.edu.itec1misiones.dto.response.PeriodoAcademicoResponse;

import java.util.List;

public interface PeriodoAcademicoService {
    PeriodoAcademicoResponse guardar(PeriodoAcademicoRequest request);
    List<PeriodoAcademicoResponse> buscarTodos();
    PeriodoAcademicoResponse buscarPorId(Long id);
    PeriodoAcademicoResponse actualizar(Long id, PeriodoAcademicoRequest request);
    void eliminar(Long id);
}
