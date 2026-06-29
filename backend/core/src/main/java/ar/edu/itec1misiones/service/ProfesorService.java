package ar.edu.itec1misiones.service;

import ar.edu.itec1misiones.dto.request.ProfesorRequest;
import ar.edu.itec1misiones.dto.request.ProfesorUpdateRequest;
import ar.edu.itec1misiones.dto.response.ProfesorResponse;
import ar.edu.itec1misiones.model.User;

import java.util.List;

public interface ProfesorService {
    void crearProfesorConUsuario(User user);
    ProfesorResponse crear(ProfesorRequest request);
    List<ProfesorResponse> listarActivos();
    ProfesorResponse buscarPorId(Long id);
    ProfesorResponse buscarPorDni(String dni);
    ProfesorResponse actualizar(Long id, ProfesorUpdateRequest request);
    void desactivar(Long id);
}
