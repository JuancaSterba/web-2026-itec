package ar.edu.itec1misiones.service;

import ar.edu.itec1misiones.dto.request.ComisionRequest;
import ar.edu.itec1misiones.dto.response.ComisionResponse;

import java.util.List;

public interface ComisionService {
    ComisionResponse guardar(ComisionRequest request);
    List<ComisionResponse> buscarTodos();
    ComisionResponse buscarPorId(Long id);
}
