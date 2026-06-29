package ar.edu.itec1misiones.service;

import ar.edu.itec1misiones.dto.request.CarreraRequest;
import ar.edu.itec1misiones.dto.response.CarreraResponse;

import java.util.List;

public interface CarreraService {
    CarreraResponse crear(CarreraRequest request);
    List<CarreraResponse> listarActivas();
    CarreraResponse buscarPorId(Long id);
    CarreraResponse actualizar(Long id, CarreraRequest request);
    void desactivar(Long id);
}
