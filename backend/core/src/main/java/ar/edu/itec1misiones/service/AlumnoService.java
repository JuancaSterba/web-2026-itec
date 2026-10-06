package ar.edu.itec1misiones.service;

import ar.edu.itec1misiones.dto.request.AlumnoRegistroDTO;
import ar.edu.itec1misiones.dto.request.AlumnoUpdateRequest;
import ar.edu.itec1misiones.dto.response.AlumnoResponse;
import ar.edu.itec1misiones.model.User;

import java.util.List;

public interface AlumnoService {
    void crearAlumnoConUsuario(User user);

    /** Alta de un solo paso: crea el Usuario (username/password=DNI) y el Alumno en la misma transaccion. */
    AlumnoResponse crearConUsuario(AlumnoRegistroDTO dto);
    List<AlumnoResponse> listarActivos();
    AlumnoResponse buscarPorId(Long id);
    AlumnoResponse buscarPorLegajo(String legajo);
    AlumnoResponse buscarPorDni(String dni);
    AlumnoResponse actualizar(Long id, AlumnoUpdateRequest request);
    void desactivar(Long id);
}
