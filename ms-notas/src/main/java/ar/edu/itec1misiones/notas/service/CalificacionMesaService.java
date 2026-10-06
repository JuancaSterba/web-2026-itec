package ar.edu.itec1misiones.notas.service;

import ar.edu.itec1misiones.notas.dto.CalificacionMesaRequest;
import ar.edu.itec1misiones.notas.model.CalificacionMesa;
import ar.edu.itec1misiones.notas.repository.CalificacionMesaRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import ar.edu.itec1misiones.notas.client.MesaExamenClient;

import java.util.List;

@Service
public class CalificacionMesaService {

    private final CalificacionMesaRepository calificacionMesaRepository;
    private final MesaExamenClient mesaExamenClient;

    public CalificacionMesaService(CalificacionMesaRepository calificacionMesaRepository, MesaExamenClient mesaExamenClient) {
        this.calificacionMesaRepository = calificacionMesaRepository;
        this.mesaExamenClient = mesaExamenClient;
    }

    public CalificacionMesa crear(CalificacionMesaRequest request) {
        if (calificacionMesaRepository.existsByMesaExamenIdAndAlumnoId(
                request.getMesaExamenId(), request.getAlumnoId())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "El alumno " + request.getAlumnoId() + " ya tiene una calificación en la mesa "
                            + request.getMesaExamenId());
        }
        validarMesaAbierta(request.getMesaExamenId());

        CalificacionMesa calificacion = new CalificacionMesa();
        aplicarRequest(calificacion, request);
        return calificacionMesaRepository.save(calificacion);
    }

    public List<CalificacionMesa> listarPorMesa(Long mesaExamenId) {
        return calificacionMesaRepository.findByMesaExamenId(mesaExamenId);
    }

    public CalificacionMesa actualizar(Long id, CalificacionMesaRequest request) {
        CalificacionMesa calificacion = calificacionMesaRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Calificación de mesa no encontrada: " + id));
        validarMesaAbierta(request.getMesaExamenId());
        aplicarRequest(calificacion, request);
        return calificacionMesaRepository.save(calificacion);
    }

    private void aplicarRequest(CalificacionMesa calificacion, CalificacionMesaRequest request) {
        calificacion.setMesaExamenId(request.getMesaExamenId());
        calificacion.setAlumnoId(request.getAlumnoId());
        calificacion.setNota(request.getNota());
        calificacion.setAusente(request.getAusente() != null && request.getAusente());
        calificacion.setLibro(request.getLibro());
        calificacion.setFolio(request.getFolio());
    }

    private void validarMesaAbierta(Long mesaExamenId) {
        if (!mesaExamenClient.isMesaAbierta(mesaExamenId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "La mesa de examen se encuentra cerrada, no se pueden modificar las notas.");
        }
    }
}
