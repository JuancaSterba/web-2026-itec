package ar.edu.itec1misiones.asistencias.service;

import ar.edu.itec1misiones.asistencias.client.HorarioClient;
import ar.edu.itec1misiones.asistencias.dto.AsistenciaRequest;
import ar.edu.itec1misiones.asistencias.model.Asistencia;
import ar.edu.itec1misiones.asistencias.repository.AsistenciaRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.List;
import java.util.Set;

@Service
public class AsistenciaService {

    private final AsistenciaRepository asistenciaRepository;
    private final HorarioClient horarioClient;

    public AsistenciaService(AsistenciaRepository asistenciaRepository, HorarioClient horarioClient) {
        this.asistenciaRepository = asistenciaRepository;
        this.horarioClient = horarioClient;
    }

    public Asistencia crear(AsistenciaRequest request) {
        validarFechaDeClase(request.getComisionId(), request.getFecha());

        Asistencia asistencia = new Asistencia();
        asistencia.setCursadaId(request.getCursadaId());
        asistencia.setComisionId(request.getComisionId());
        asistencia.setFecha(request.getFecha());
        asistencia.setEstado(request.getEstado());
        return asistenciaRepository.save(asistencia);
    }

    public List<Asistencia> listar(Long cursadaId, LocalDate fecha) {
        return asistenciaRepository.buscarPorFiltros(cursadaId, fecha);
    }

    public Asistencia actualizar(Long id, AsistenciaRequest request) {
        validarFechaDeClase(request.getComisionId(), request.getFecha());

        Asistencia asistencia = buscarPorId(id);
        asistencia.setCursadaId(request.getCursadaId());
        asistencia.setComisionId(request.getComisionId());
        asistencia.setFecha(request.getFecha());
        asistencia.setEstado(request.getEstado());
        return asistenciaRepository.save(asistencia);
    }

    private void validarFechaDeClase(Long comisionId, LocalDate fecha) {
        Set<DayOfWeek> diasDeClase = horarioClient.diasDeClase(comisionId);
        if (!diasDeClase.contains(fecha.getDayOfWeek())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "La fecha no coincide con ningún día de clase de la comisión");
        }
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
