package ar.edu.itec1misiones.notas.service;

import ar.edu.itec1misiones.notas.dto.ExamenRequest;
import ar.edu.itec1misiones.notas.model.Examen;
import ar.edu.itec1misiones.notas.repository.ExamenRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class ExamenService {

    private final ExamenRepository examenRepository;

    public ExamenService(ExamenRepository examenRepository) {
        this.examenRepository = examenRepository;
    }

    public Examen crear(ExamenRequest request) {
        Examen examen = new Examen();
        examen.setComisionId(request.getComisionId());
        examen.setNombre(request.getNombre());
        examen.setFecha(request.getFecha());
        return examenRepository.save(examen);
    }

    public List<Examen> listar(Long comisionId) {
        return examenRepository.buscarPorFiltros(comisionId);
    }

    public Examen actualizar(Long id, ExamenRequest request) {
        Examen examen = buscarPorId(id);
        examen.setComisionId(request.getComisionId());
        examen.setNombre(request.getNombre());
        examen.setFecha(request.getFecha());
        return examenRepository.save(examen);
    }

    public void eliminar(Long id) {
        Examen examen = buscarPorId(id);
        examenRepository.delete(examen);
    }

    private Examen buscarPorId(Long id) {
        return examenRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Examen no encontrado: " + id));
    }
}
