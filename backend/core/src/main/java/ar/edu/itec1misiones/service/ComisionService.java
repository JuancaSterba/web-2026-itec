package ar.edu.itec1misiones.service;

import ar.edu.itec1misiones.dto.request.ComisionRequest;
import ar.edu.itec1misiones.dto.response.ComisionResponse;

import java.util.List;

public interface ComisionService {
    ComisionResponse crear(ComisionRequest request);
    List<ComisionResponse> listarActivas();
    ComisionResponse buscarPorId(Long id);
    List<ComisionResponse> listarPorMateria(Long materiaId);
    List<ComisionResponse> listarPorCuatrimestre(Long cuatrimestreId);
    List<ComisionResponse> listarPorProfesor(Long profesorId);
    ComisionResponse actualizar(Long id, ComisionRequest request);
    void desactivar(Long id);
}
