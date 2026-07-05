package ar.edu.itec1misiones.asistencias.service;

import ar.edu.itec1misiones.asistencias.dto.AsistenciaRequest;
import ar.edu.itec1misiones.asistencias.model.Asistencia;
import ar.edu.itec1misiones.asistencias.repository.AsistenciaRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;

@Service
public class AsistenciaService {

    private final AsistenciaRepository asistenciaRepository;

    public AsistenciaService(AsistenciaRepository asistenciaRepository) {
        this.asistenciaRepository = asistenciaRepository;
    }

    public Asistencia crear(AsistenciaRequest request) {
        Asistencia asistencia = new Asistencia();
        asistencia.setAlumnoId(request.getAlumnoId());
        asistencia.setComisionId(request.getComisionId());
        asistencia.setFecha(request.getFecha());
        asistencia.setEstado(request.getEstado());
        return asistenciaRepository.save(asistencia);
    }

    public List<Asistencia> listar(Long comisionId, LocalDate fecha) {
        return asistenciaRepository.buscarPorFiltros(comisionId, fecha);
    }

    public Asistencia actualizar(Long id, AsistenciaRequest request) {
        Asistencia asistencia = buscarPorId(id);
        asistencia.setAlumnoId(request.getAlumnoId());
        asistencia.setComisionId(request.getComisionId());
        asistencia.setFecha(request.getFecha());
        asistencia.setEstado(request.getEstado());
        return asistenciaRepository.save(asistencia);
    }

    public void eliminar(Long id) {
        Asistencia asistencia = buscarPorId(id);
        asistenciaRepository.delete(asistencia);
    }

    private Asistencia buscarPorId(Long id) {
        return asistenciaRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Asistencia no encontrada: " + id));
    }
}
