package ar.edu.itec1misiones.service;

import ar.edu.itec1misiones.dto.request.InscripcionCarreraRequest;
import ar.edu.itec1misiones.dto.response.InscripcionCarreraResponse;

import java.util.List;

public interface InscripcionCarreraService {
    InscripcionCarreraResponse guardar(InscripcionCarreraRequest request);
    List<InscripcionCarreraResponse> buscarTodos();
    InscripcionCarreraResponse buscarPorId(Long id);
    InscripcionCarreraResponse actualizar(Long id, InscripcionCarreraRequest request);
    void darDeBaja(Long id);
}
