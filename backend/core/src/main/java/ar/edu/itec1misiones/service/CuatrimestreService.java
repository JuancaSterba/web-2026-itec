package ar.edu.itec1misiones.service;

import ar.edu.itec1misiones.dto.request.CuatrimestreRequest;
import ar.edu.itec1misiones.dto.response.CuatrimestreResponse;

import java.util.List;

public interface CuatrimestreService {
    CuatrimestreResponse crear(CuatrimestreRequest request);
    List<CuatrimestreResponse> listarTodos();
    CuatrimestreResponse buscarPorId(Long id);
    CuatrimestreResponse buscarActual();
    CuatrimestreResponse actualizar(Long id, CuatrimestreRequest request);
    void eliminar(Long id);
}
