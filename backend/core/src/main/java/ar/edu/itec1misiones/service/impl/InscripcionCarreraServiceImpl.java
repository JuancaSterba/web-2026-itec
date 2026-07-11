package ar.edu.itec1misiones.service.impl;

import ar.edu.itec1misiones.dto.request.InscripcionCarreraRequest;
import ar.edu.itec1misiones.dto.response.InscripcionCarreraResponse;
import ar.edu.itec1misiones.exception.AlumnoNotFoundException;
import ar.edu.itec1misiones.exception.AlumnoYaInscriptoEnCarreraException;
import ar.edu.itec1misiones.exception.InscripcionCarreraNotFoundException;
import ar.edu.itec1misiones.exception.PlanEstudioNotFoundException;
import ar.edu.itec1misiones.model.Alumno;
import ar.edu.itec1misiones.model.InscripcionCarrera;
import ar.edu.itec1misiones.model.PlanEstudio;
import ar.edu.itec1misiones.repository.AlumnoRepository;
import ar.edu.itec1misiones.repository.InscripcionCarreraRepository;
import ar.edu.itec1misiones.repository.PlanEstudioRepository;
import ar.edu.itec1misiones.service.InscripcionCarreraService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
public class InscripcionCarreraServiceImpl implements InscripcionCarreraService {

    private static final String ESTADO_BAJA = "BAJA";

    private final InscripcionCarreraRepository inscripcionCarreraRepository;
    private final AlumnoRepository alumnoRepository;
    private final PlanEstudioRepository planEstudioRepository;

    @Override
    public InscripcionCarreraResponse guardar(InscripcionCarreraRequest request) {
        Alumno alumno = alumnoRepository.findById(request.getAlumnoId())
                .orElseThrow(() -> new AlumnoNotFoundException(request.getAlumnoId()));
        PlanEstudio planEstudio = planEstudioRepository.findById(request.getPlanEstudioId())
                .orElseThrow(() -> new PlanEstudioNotFoundException(request.getPlanEstudioId()));

        // Regla de negocio: inscripción única por carrera (cualquier plan/ciclo).
        // Las inscripciones en estado BAJA no bloquean, para permitir re-alta.
        Long carreraId = planEstudio.getCarrera().getId();
        if (inscripcionCarreraRepository.existsByAlumnoIdAndPlanEstudioCarreraIdAndEstadoNot(
                alumno.getId(), carreraId, ESTADO_BAJA)) {
            throw new AlumnoYaInscriptoEnCarreraException(alumno.getId(), planEstudio.getCarrera().getNombre());
        }

        InscripcionCarrera inscripcion = new InscripcionCarrera();
        inscripcion.setAlumno(alumno);
        inscripcion.setPlanEstudio(planEstudio);
        inscripcion.setFechaInscripcion(request.getFechaInscripcion());
        inscripcion.setEstado(request.getEstado());

        return toResponse(inscripcionCarreraRepository.save(inscripcion));
    }

    @Override
    @Transactional(readOnly = true)
    public List<InscripcionCarreraResponse> buscarTodos() {
        return inscripcionCarreraRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public InscripcionCarreraResponse buscarPorId(Long id) {
        return toResponse(inscripcionCarreraRepository.findById(id)
                .orElseThrow(() -> new InscripcionCarreraNotFoundException(id)));
    }

    @Override
    public InscripcionCarreraResponse actualizar(Long id, InscripcionCarreraRequest request) {
        InscripcionCarrera inscripcion = inscripcionCarreraRepository.findById(id)
                .orElseThrow(() -> new InscripcionCarreraNotFoundException(id));

        inscripcion.setFechaInscripcion(request.getFechaInscripcion());
        inscripcion.setEstado(request.getEstado());

        return toResponse(inscripcionCarreraRepository.save(inscripcion));
    }

    @Override
    public void darDeBaja(Long id) {
        InscripcionCarrera inscripcion = inscripcionCarreraRepository.findById(id)
                .orElseThrow(() -> new InscripcionCarreraNotFoundException(id));
        inscripcion.setEstado(ESTADO_BAJA);
        inscripcionCarreraRepository.save(inscripcion);
    }

    private InscripcionCarreraResponse toResponse(InscripcionCarrera inscripcion) {
        return InscripcionCarreraResponse.builder()
                .id(inscripcion.getId())
                .alumnoId(inscripcion.getAlumno().getId())
                .planEstudioId(inscripcion.getPlanEstudio().getId())
                .fechaInscripcion(inscripcion.getFechaInscripcion())
                .estado(inscripcion.getEstado())
                .build();
    }
}
