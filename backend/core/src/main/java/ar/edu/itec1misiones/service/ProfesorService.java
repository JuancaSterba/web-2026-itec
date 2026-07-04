package ar.edu.itec1misiones.service;

import ar.edu.itec1misiones.dto.request.ProfesorRegistroDTO;
import ar.edu.itec1misiones.dto.request.ProfesorUpdateRequest;
import ar.edu.itec1misiones.dto.response.ProfesorResponse;
import ar.edu.itec1misiones.model.User;

import java.util.List;

public interface ProfesorService {
    void crearProfesorConUsuario(User user);

    /** Alta de un solo paso: crea el Usuario (username/password=DNI) y el Profesor en la misma transaccion. */
    ProfesorResponse crearConUsuario(ProfesorRegistroDTO dto);
    List<ProfesorResponse> listarActivos();
    ProfesorResponse buscarPorId(Long id);
    ProfesorResponse buscarPorDni(String dni);
    ProfesorResponse actualizar(Long id, ProfesorUpdateRequest request);
    void desactivar(Long id);
}
