package ar.edu.itec1misiones.service.impl;

import ar.edu.itec1misiones.dto.request.AlumnoCarreraRequest;
import ar.edu.itec1misiones.dto.response.AlumnoCarreraResponse;
import ar.edu.itec1misiones.exception.AlumnoCarreraNotFoundException;
import ar.edu.itec1misiones.exception.AlumnoNotFoundException;
import ar.edu.itec1misiones.exception.AlumnoYaInscriptoException;
import ar.edu.itec1misiones.exception.CarreraNotFoundException;
import ar.edu.itec1misiones.exception.PlanEstudioNotFoundException;
import ar.edu.itec1misiones.model.Alumno;
import ar.edu.itec1misiones.model.AlumnoCarrera;
import ar.edu.itec1misiones.model.Carrera;
import ar.edu.itec1misiones.model.PlanEstudio;
import ar.edu.itec1misiones.repository.AlumnoCarreraRepository;
import ar.edu.itec1misiones.repository.AlumnoRepository;
import ar.edu.itec1misiones.repository.CarreraRepository;
import ar.edu.itec1misiones.repository.PlanEstudioRepository;
import ar.edu.itec1misiones.service.AlumnoCarreraService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
public class AlumnoCarreraServiceImpl implements AlumnoCarreraService {

    private final AlumnoCarreraRepository alumnoCarreraRepository;
    private final AlumnoRepository alumnoRepository;
    private final CarreraRepository carreraRepository;
    private final PlanEstudioRepository planEstudioRepository;

    @Override
    @Transactional(readOnly = true)
    public List<AlumnoCarreraResponse> getAll() {
        return alumnoCarreraRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public AlumnoCarreraResponse getById(Long id) {
        return toResponse(alumnoCarreraRepository.findById(id)
                .orElseThrow(() -> new AlumnoCarreraNotFoundException(id)));
    }

    @Override
    @Transactional(readOnly = true)
    public List<AlumnoCarreraResponse> getByAlumnoId(Long alumnoId) {
        if (!alumnoRepository.existsById(alumnoId)) {
            throw new AlumnoNotFoundException(alumnoId);
        }
        return alumnoCarreraRepository.findByAlumnoId(alumnoId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public AlumnoCarreraResponse create(AlumnoCarreraRequest request) {
        if (alumnoCarreraRepository.existsByAlumnoIdAndCarreraId(request.getAlumnoId(), request.getCarreraId())) {
            throw new AlumnoYaInscriptoException(request.getAlumnoId(), request.getCarreraId());
        }

        Alumno alumno = alumnoRepository.findById(request.getAlumnoId())
                .orElseThrow(() -> new AlumnoNotFoundException(request.getAlumnoId()));
        Carrera carrera = carreraRepository.findById(request.getCarreraId())
                .orElseThrow(() -> new CarreraNotFoundException(request.getCarreraId()));
        PlanEstudio planEstudio = planEstudioRepository.findById(request.getPlanEstudioId())
                .orElseThrow(() -> new PlanEstudioNotFoundException(request.getPlanEstudioId()));

        AlumnoCarrera inscripcion = new AlumnoCarrera();
        inscripcion.setAlumno(alumno);
        inscripcion.setCarrera(carrera);
        inscripcion.setPlanEstudio(planEstudio);
        inscripcion.setAnioIngreso(request.getAnioIngreso());

        return toResponse(alumnoCarreraRepository.save(inscripcion));
    }

    @Override
    public void delete(Long id) {
        if (!alumnoCarreraRepository.existsById(id)) {
            throw new AlumnoCarreraNotFoundException(id);
        }
        alumnoCarreraRepository.deleteById(id);
    }

    private AlumnoCarreraResponse toResponse(AlumnoCarrera inscripcion) {
        Alumno alumno = inscripcion.getAlumno();
        String nombreCompleto = alumno.getUser().getNombre() + " " + alumno.getUser().getApellido();

        return AlumnoCarreraResponse.builder()
                .id(inscripcion.getId())
                .alumnoId(alumno.getId())
                .alumnoNombreCompleto(nombreCompleto)
                .carreraId(inscripcion.getCarrera().getId())
                .carreraNombre(inscripcion.getCarrera().getNombre())
                .planEstudioId(inscripcion.getPlanEstudio().getId())
                .planEstudioResolucion(inscripcion.getPlanEstudio().getResolucion())
                .anioIngreso(inscripcion.getAnioIngreso())
                .build();
    }
}
