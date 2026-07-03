package ar.edu.itec1misiones.service;

import ar.edu.itec1misiones.dto.request.AlumnoInscriptoRequest;
import ar.edu.itec1misiones.dto.response.AlumnoInscriptoResponse;

import java.util.List;

public interface AlumnoInscriptoService {
    List<AlumnoInscriptoResponse> getAll();
    AlumnoInscriptoResponse getById(Long id);
    List<AlumnoInscriptoResponse> getByAlumnoCarreraId(Long alumnoCarreraId);
    AlumnoInscriptoResponse create(AlumnoInscriptoRequest request);
    void delete(Long id);
}
