package ar.edu.itec1misiones.service;

import ar.edu.itec1misiones.dto.request.MateriaPlanRequest;
import ar.edu.itec1misiones.dto.response.MateriaPlanResponse;

import java.util.List;

public interface MateriaPlanService {
    MateriaPlanResponse guardar(MateriaPlanRequest request);
    List<MateriaPlanResponse> buscarTodos();
    MateriaPlanResponse buscarPorId(Long id);
}
