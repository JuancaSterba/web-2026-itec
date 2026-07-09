package ar.edu.itec1misiones.notas.service;

import ar.edu.itec1misiones.notas.dto.CalificacionParcialRequest;
import ar.edu.itec1misiones.notas.model.CalificacionParcial;
import ar.edu.itec1misiones.notas.model.TipoInstancia;
import ar.edu.itec1misiones.notas.repository.CalificacionParcialRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class CalificacionParcialService {

    private final CalificacionParcialRepository calificacionParcialRepository;

    public CalificacionParcialService(CalificacionParcialRepository calificacionParcialRepository) {
        this.calificacionParcialRepository = calificacionParcialRepository;
    }

    public CalificacionParcial crear(CalificacionParcialRequest request) {
        if (request.getTipo() == TipoInstancia.PARCIAL
                && calificacionParcialRepository.countByCursadaIdAndTipo(request.getCursadaId(), TipoInstancia.PARCIAL) >= 3) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Ya se cargaron los 3 parciales de esta cursada");
        }

        CalificacionParcial calificacion = new CalificacionParcial();
        calificacion.setCursadaId(request.getCursadaId());
        calificacion.setComisionId(request.getComisionId());
        calificacion.setInstancia(request.getInstancia());
        calificacion.setNota(request.getNota());
        calificacion.setFecha(request.getFecha());
        calificacion.setTipo(request.getTipo());
        return calificacionParcialRepository.save(calificacion);
    }

    public List<CalificacionParcial> listar(Long cursadaId) {
        return calificacionParcialRepository.buscarPorFiltros(cursadaId);
    }

    public CalificacionParcial actualizar(Long id, CalificacionParcialRequest request) {
        CalificacionParcial calificacion = buscarPorId(id);
        calificacion.setCursadaId(request.getCursadaId());
        calificacion.setComisionId(request.getComisionId());
        calificacion.setInstancia(request.getInstancia());
        calificacion.setNota(request.getNota());
        calificacion.setFecha(request.getFecha());
        calificacion.setTipo(request.getTipo());
        return calificacionParcialRepository.save(calificacion);
    }

    public void eliminar(Long id) {
        CalificacionParcial calificacion = buscarPorId(id);
        calificacionParcialRepository.delete(calificacion);
    }

    private CalificacionParcial buscarPorId(Long id) {
        return calificacionParcialRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Calificación parcial no encontrada: " + id));
    }
}
