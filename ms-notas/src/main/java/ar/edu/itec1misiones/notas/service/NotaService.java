package ar.edu.itec1misiones.notas.service;

import ar.edu.itec1misiones.notas.dto.NotaRequest;
import ar.edu.itec1misiones.notas.model.Nota;
import ar.edu.itec1misiones.notas.repository.NotaRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class NotaService {

    private final NotaRepository notaRepository;

    public NotaService(NotaRepository notaRepository) {
        this.notaRepository = notaRepository;
    }

    public Nota crear(NotaRequest request) {
        Nota nota = new Nota();
        nota.setExamenId(request.getExamenId());
        nota.setAlumnoId(request.getAlumnoId());
        nota.setValor(request.getValor());
        nota.setObservaciones(request.getObservaciones());
        return notaRepository.save(nota);
    }

    public List<Nota> listar() {
        return notaRepository.findAll();
    }

    public Nota actualizar(Long id, NotaRequest request) {
        Nota nota = buscarPorId(id);
        nota.setExamenId(request.getExamenId());
        nota.setAlumnoId(request.getAlumnoId());
        nota.setValor(request.getValor());
        nota.setObservaciones(request.getObservaciones());
        return notaRepository.save(nota);
    }

    public void eliminar(Long id) {
        Nota nota = buscarPorId(id);
        notaRepository.delete(nota);
    }

    private Nota buscarPorId(Long id) {
        return notaRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Nota no encontrada: " + id));
    }
}
