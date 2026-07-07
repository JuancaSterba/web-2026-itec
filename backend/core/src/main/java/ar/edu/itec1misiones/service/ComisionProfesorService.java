package ar.edu.itec1misiones.service;

import ar.edu.itec1misiones.dto.request.ComisionProfesorRequest;
import ar.edu.itec1misiones.dto.response.ComisionProfesorResponse;

import java.util.List;

public interface ComisionProfesorService {
    ComisionProfesorResponse guardar(ComisionProfesorRequest request);
    List<ComisionProfesorResponse> buscarTodos();
    ComisionProfesorResponse buscarPorId(Long id);
    ComisionProfesorResponse actualizar(Long id, ComisionProfesorRequest request);
    void eliminar(Long id);
}
