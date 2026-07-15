package ar.edu.itec1misiones.notas.service;

import ar.edu.itec1misiones.notas.client.HorarioClient;
import ar.edu.itec1misiones.notas.dto.CalificacionParcialRequest;
import ar.edu.itec1misiones.notas.model.CalificacionParcial;
import ar.edu.itec1misiones.notas.repository.CalificacionParcialRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.DayOfWeek;
import java.util.List;
import java.util.Set;

@Service
public class CalificacionParcialService {

    private final CalificacionParcialRepository calificacionParcialRepository;
    private final HorarioClient horarioClient;

    public CalificacionParcialService(CalificacionParcialRepository calificacionParcialRepository,
                                       HorarioClient horarioClient) {
        this.calificacionParcialRepository = calificacionParcialRepository;
        this.horarioClient = horarioClient;
    }

    public CalificacionParcial crear(CalificacionParcialRequest request) {
        if (calificacionParcialRepository.countByCursadaId(request.getCursadaId()) >= 3) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Ya se cargaron los 3 parciales de esta cursada");
        }
        validarFechaDeClase(request.getComisionId(), request.getFecha());

        CalificacionParcial calificacion = new CalificacionParcial();
        calificacion.setCursadaId(request.getCursadaId());
        calificacion.setComisionId(request.getComisionId());
        calificacion.setInstancia(request.getInstancia());
        calificacion.setNota(request.getNota());
        calificacion.setFecha(request.getFecha());
        return calificacionParcialRepository.save(calificacion);
    }

    public List<CalificacionParcial> listar(Long cursadaId) {
        return calificacionParcialRepository.buscarPorFiltros(cursadaId);
    }

    public CalificacionParcial actualizar(Long id, CalificacionParcialRequest request) {
        CalificacionParcial calificacion = buscarPorId(id);
        validarFechaDeClase(request.getComisionId(), request.getFecha());
        calificacion.setCursadaId(request.getCursadaId());
        calificacion.setComisionId(request.getComisionId());
        calificacion.setInstancia(request.getInstancia());
        calificacion.setNota(request.getNota());
        calificacion.setFecha(request.getFecha());
        return calificacionParcialRepository.save(calificacion);
    }

    public void eliminar(Long id) {
        CalificacionParcial calificacion = buscarPorId(id);
        calificacionParcialRepository.delete(calificacion);
    }

    private void validarFechaDeClase(Long comisionId, java.time.LocalDate fecha) {
        Set<DayOfWeek> diasDeClase = horarioClient.diasDeClase(comisionId);
        if (!diasDeClase.contains(fecha.getDayOfWeek())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "La fecha no coincide con ningún día de clase de la comisión");
        }
    }

    private CalificacionParcial buscarPorId(Long id) {
        return calificacionParcialRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Calificación parcial no encontrada: " + id));
    }
}
