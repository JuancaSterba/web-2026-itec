package ar.edu.itec1misiones.service.impl;

import ar.edu.itec1misiones.dto.request.AlumnoInscriptoRequest;
import ar.edu.itec1misiones.dto.response.AlumnoInscriptoResponse;
import ar.edu.itec1misiones.exception.*;
import ar.edu.itec1misiones.model.*;
import ar.edu.itec1misiones.repository.*;
import ar.edu.itec1misiones.service.AlumnoInscriptoService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
public class AlumnoInscriptoServiceImpl implements AlumnoInscriptoService {

    private final AlumnoInscriptoRepository alumnoInscriptoRepository;
    private final AlumnoCarreraRepository alumnoCarreraRepository;
    private final ComisionMateriaRepository comisionMateriaRepository;

    @Override
    @Transactional(readOnly = true)
    public List<AlumnoInscriptoResponse> getAll() {
        return alumnoInscriptoRepository.findAllConDetalle().stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public AlumnoInscriptoResponse getById(Long id) {
        return toResponse(alumnoInscriptoRepository.findById(id)
                .orElseThrow(() -> new AlumnoInscriptoNotFoundException(id)));
    }

    @Override
    @Transactional(readOnly = true)
    public List<AlumnoInscriptoResponse> getByAlumnoCarreraId(Long alumnoCarreraId) {
        if (!alumnoCarreraRepository.existsById(alumnoCarreraId)) {
            throw new AlumnoCarreraNotFoundException(alumnoCarreraId);
        }
        return alumnoInscriptoRepository.findByAlumnoCarreraIdConDetalle(alumnoCarreraId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public AlumnoInscriptoResponse create(AlumnoInscriptoRequest request) {
        AlumnoCarrera alumnoCarrera = alumnoCarreraRepository.findById(request.getAlumnoCarreraId())
                .orElseThrow(() -> new AlumnoCarreraNotFoundException(request.getAlumnoCarreraId()));

        ComisionMateria comision = comisionMateriaRepository.findById(request.getComisionMateriaId())
                .orElseThrow(() -> new ComisionNotFoundException(request.getComisionMateriaId()));

        if (!comision.isActiva()) {
            throw new ComisionInactivaException(comision.getId());
        }

        if (alumnoInscriptoRepository.existsByAlumnoCarreraIdAndComisionId(
                request.getAlumnoCarreraId(), request.getComisionMateriaId())) {
            throw new AlumnoYaInscriptoEnMateriaException(
                    request.getAlumnoCarreraId(), request.getComisionMateriaId());
        }

        long inscriptosActuales = alumnoInscriptoRepository.countByComisionId(comision.getId());
        if (inscriptosActuales >= comision.getCupo()) {
            throw new CupoComisionLlenoException(comision.getId());
        }

        AlumnoInscripto inscripcion = new AlumnoInscripto();
        inscripcion.setAlumnoCarrera(alumnoCarrera);
        inscripcion.setComision(comision);
        inscripcion.setEstado(EstadoCursada.REGULAR);

        return toResponse(alumnoInscriptoRepository.save(inscripcion));
    }

    @Override
    public void delete(Long id) {
        if (!alumnoInscriptoRepository.existsById(id)) {
            throw new AlumnoInscriptoNotFoundException(id);
        }
        alumnoInscriptoRepository.deleteById(id);
    }

    private AlumnoInscriptoResponse toResponse(AlumnoInscripto i) {
        AlumnoCarrera ac = i.getAlumnoCarrera();
        Alumno alumno = ac.getAlumno();
        User user = alumno.getUser();
        ComisionMateria cm = i.getComision();

        return AlumnoInscriptoResponse.builder()
                .id(i.getId())
                .alumnoCarreraId(ac.getId())
                .alumnoId(alumno.getId())
                .nombre(user.getNombre())
                .apellido(user.getApellido())
                .dni(user.getDni())
                .legajo(user.getLegajo())
                .comisionMateriaId(cm.getId())
                .materiaNombre(cm.getMateria().getNombre())
                .comisionNombre(cm.getNombre())
                .estado(i.getEstado())
                .notaFinal(i.getNotaFinal())
                .build();
    }
}
