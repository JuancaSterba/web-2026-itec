package ar.edu.itec1misiones.service;

import ar.edu.itec1misiones.dto.request.CursadaRequest;
import ar.edu.itec1misiones.dto.response.CursadaResponse;

import java.util.List;

public interface CursadaService {
    CursadaResponse guardar(CursadaRequest request);
    List<CursadaResponse> buscarTodos();
    CursadaResponse buscarPorId(Long id);
    CursadaResponse actualizar(Long id, CursadaRequest request);
    void eliminar(Long id);
}
