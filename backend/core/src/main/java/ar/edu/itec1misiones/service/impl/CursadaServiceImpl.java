package ar.edu.itec1misiones.service.impl;

import ar.edu.itec1misiones.dto.request.CursadaRequest;
import ar.edu.itec1misiones.dto.response.CursadaResponse;
import ar.edu.itec1misiones.exception.AlumnoNotFoundException;
import ar.edu.itec1misiones.exception.AlumnoYaInscriptoEnComisionException;
import ar.edu.itec1misiones.exception.ComisionNotFoundException;
import ar.edu.itec1misiones.exception.CursadaNotFoundException;
import ar.edu.itec1misiones.model.Alumno;
import ar.edu.itec1misiones.model.Comision;
import ar.edu.itec1misiones.model.CondicionFinal;
import ar.edu.itec1misiones.model.Cursada;
import ar.edu.itec1misiones.model.MateriaPlan;
import ar.edu.itec1misiones.repository.AlumnoRepository;
import ar.edu.itec1misiones.repository.ComisionRepository;
import ar.edu.itec1misiones.repository.CursadaRepository;
import ar.edu.itec1misiones.service.CursadaService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
public class CursadaServiceImpl implements CursadaService {

    private final CursadaRepository cursadaRepository;
    private final AlumnoRepository alumnoRepository;
    private final ComisionRepository comisionRepository;

    @Override
    public CursadaResponse guardar(CursadaRequest request) {
        Alumno alumno = alumnoRepository.findById(request.getAlumnoId())
                .orElseThrow(() -> new AlumnoNotFoundException(request.getAlumnoId()));
        Comision comision = comisionRepository.findById(request.getComisionId())
                .orElseThrow(() -> new ComisionNotFoundException(request.getComisionId()));

        validarCorrelativas(alumno.getId(), comision);

        if (cursadaRepository.existsByAlumnoIdAndComisionId(alumno.getId(), comision.getId())) {
            throw new AlumnoYaInscriptoEnComisionException(alumno.getId(), comision.getId());
        }

        Cursada cursada = new Cursada();
        cursada.setAlumno(alumno);
        cursada.setComision(comision);
        cursada.setFechaInscripcion(request.getFechaInscripcion());
        cursada.setCondicionFinal(request.getCondicionFinal());
        cursada.setNotaCierre(request.getNotaCierre());

        return toResponse(cursadaRepository.save(cursada));
    }

    @Override
    @Transactional(readOnly = true)
    public List<CursadaResponse> buscarTodos() {
        return cursadaRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public CursadaResponse buscarPorId(Long id) {
        return toResponse(cursadaRepository.findById(id)
                .orElseThrow(() -> new CursadaNotFoundException(id)));
    }

    @Override
    public CursadaResponse actualizar(Long id, CursadaRequest request) {
        Cursada cursada = cursadaRepository.findById(id)
                .orElseThrow(() -> new CursadaNotFoundException(id));

        cursada.setFechaInscripcion(request.getFechaInscripcion());
        cursada.setCondicionFinal(request.getCondicionFinal());
        cursada.setNotaCierre(request.getNotaCierre());

        return toResponse(cursadaRepository.save(cursada));
    }

    @Override
    public void eliminar(Long id) {
        Cursada cursada = cursadaRepository.findById(id)
                .orElseThrow(() -> new CursadaNotFoundException(id));
        cursadaRepository.delete(cursada);
    }

    private void validarCorrelativas(Long alumnoId, Comision comision) {
        MateriaPlan materiaPlan = comision.getMateriaPlan();
        if (materiaPlan == null || materiaPlan.getCorrelativas().isEmpty()) {
            return;
        }

        List<Cursada> cursadasDelAlumno = cursadaRepository.findByAlumnoId(alumnoId);
        List<String> faltantes = materiaPlan.getCorrelativas().stream()
                .filter(correlativa -> cursadasDelAlumno.stream().noneMatch(c ->
                        c.getComision().getMateriaPlan().getId().equals(correlativa.getId())
                                && esAprobada(c.getCondicionFinal())))
                .map(correlativa -> correlativa.getMateria().getNombre())
                .toList();

        if (!faltantes.isEmpty()) {
            throw new IllegalArgumentException(
                    "No se puede matricular: falta aprobar la/s correlativa/s: " + String.join(", ", faltantes));
        }
    }

    private boolean esAprobada(CondicionFinal condicion) {
        return condicion == CondicionFinal.PROMOCIONADA
                || condicion == CondicionFinal.APROBADA;
    }

    private CursadaResponse toResponse(Cursada cursada) {
        return CursadaResponse.builder()
                .id(cursada.getId())
                .alumnoId(cursada.getAlumno().getId())
                .comisionId(cursada.getComision().getId())
                .fechaInscripcion(cursada.getFechaInscripcion())
                .condicionFinal(cursada.getCondicionFinal())
                .notaCierre(cursada.getNotaCierre())
                .build();
    }
}
