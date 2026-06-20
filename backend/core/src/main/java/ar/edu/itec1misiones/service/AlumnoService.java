package ar.edu.itec1misiones.service;

import ar.edu.itec1misiones.dto.request.AlumnoRequest;
import ar.edu.itec1misiones.dto.request.AlumnoUpdateRequest;
import ar.edu.itec1misiones.dto.response.AlumnoResponse;
import ar.edu.itec1misiones.model.User;

import java.util.List;

public interface AlumnoService {
    void crearAlumnoConUsuario(User user);
    AlumnoResponse crear(AlumnoRequest request);
    List<AlumnoResponse> listarActivos();
    AlumnoResponse buscarPorId(Long id);
    AlumnoResponse buscarPorLegajo(String legajo);
    AlumnoResponse buscarPorDni(String dni);
    AlumnoResponse actualizar(Long id, AlumnoUpdateRequest request);
    void desactivar(Long id);
}
