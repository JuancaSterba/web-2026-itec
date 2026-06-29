package ar.edu.itec1misiones.service;

import ar.edu.itec1misiones.dto.request.AlumnoCarreraRequest;
import ar.edu.itec1misiones.dto.response.AlumnoCarreraResponse;

import java.util.List;

public interface AlumnoCarreraService {
    List<AlumnoCarreraResponse> getAll();
    AlumnoCarreraResponse getById(Long id);
    List<AlumnoCarreraResponse> getByAlumnoId(Long alumnoId);
    AlumnoCarreraResponse create(AlumnoCarreraRequest request);
    void delete(Long id);
}
