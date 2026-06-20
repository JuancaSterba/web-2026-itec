package ar.edu.itec1misiones.service.impl;

import ar.edu.itec1misiones.dto.request.ComisionRequest;
import ar.edu.itec1misiones.dto.response.ComisionResponse;
import ar.edu.itec1misiones.exception.ComisionNotFoundException;
import ar.edu.itec1misiones.exception.CuatrimestreNotFoundException;
import ar.edu.itec1misiones.exception.MateriaNotFoundException;
import ar.edu.itec1misiones.exception.ProfesorNotFoundException;
import ar.edu.itec1misiones.model.ComisionMateria;
import ar.edu.itec1misiones.model.Cuatrimestre;
import ar.edu.itec1misiones.model.Materia;
import ar.edu.itec1misiones.model.Profesor;
import ar.edu.itec1misiones.repository.ComisionMateriaRepository;
import ar.edu.itec1misiones.repository.CuatrimestreRepository;
import ar.edu.itec1misiones.repository.MateriaRepository;
import ar.edu.itec1misiones.repository.ProfesorRepository;
import ar.edu.itec1misiones.service.ComisionService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class ComisionServiceImpl implements ComisionService {

    private final ComisionMateriaRepository comisionRepository;
    private final MateriaRepository materiaRepository;
    private final CuatrimestreRepository cuatrimestreRepository;
    private final ProfesorRepository profesorRepository;

    public ComisionServiceImpl(ComisionMateriaRepository comisionRepository,
                               MateriaRepository materiaRepository,
                               CuatrimestreRepository cuatrimestreRepository,
                               ProfesorRepository profesorRepository) {
        this.comisionRepository = comisionRepository;
        this.materiaRepository = materiaRepository;
        this.cuatrimestreRepository = cuatrimestreRepository;
        this.profesorRepository = profesorRepository;
    }

    @Override
    public ComisionResponse crear(ComisionRequest request) {
        ComisionMateria comision = new ComisionMateria();
        mapearDesdeRequest(comision, request);
        return toResponse(comisionRepository.save(comision));
    }

    @Override
    @Transactional(readOnly = true)
    public List<ComisionResponse> listarActivas() {
        return comisionRepository.findByActivaTrue().stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public ComisionResponse buscarPorId(Long id) {
        return toResponse(comisionRepository.findById(id)
                .orElseThrow(() -> new ComisionNotFoundException(id)));
    }

    @Override
    @Transactional(readOnly = true)
    public List<ComisionResponse> listarPorMateria(Long materiaId) {
        if (!materiaRepository.existsById(materiaId)) {
            throw new MateriaNotFoundException(materiaId);
        }
        return comisionRepository.findByMateriaIdAndActivaTrue(materiaId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ComisionResponse> listarPorCuatrimestre(Long cuatrimestreId) {
        if (!cuatrimestreRepository.existsById(cuatrimestreId)) {
            throw new CuatrimestreNotFoundException(cuatrimestreId);
        }
        return comisionRepository.findByCuatrimestreIdAndActivaTrue(cuatrimestreId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ComisionResponse> listarPorProfesor(Long profesorId) {
        if (!profesorRepository.existsById(profesorId)) {
            throw new ProfesorNotFoundException(profesorId);
        }
        return comisionRepository.findByProfesorIdAndActivaTrue(profesorId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public ComisionResponse actualizar(Long id, ComisionRequest request) {
        ComisionMateria comision = comisionRepository.findById(id)
                .orElseThrow(() -> new ComisionNotFoundException(id));
        mapearDesdeRequest(comision, request);
        return toResponse(comisionRepository.save(comision));
    }

    @Override
    public void desactivar(Long id) {
        ComisionMateria comision = comisionRepository.findById(id)
                .orElseThrow(() -> new ComisionNotFoundException(id));
        comision.setActiva(false);
        comisionRepository.save(comision);
    }

    private void mapearDesdeRequest(ComisionMateria comision, ComisionRequest request) {
        Materia materia = materiaRepository.findById(request.getMateriaId())
                .orElseThrow(() -> new MateriaNotFoundException(request.getMateriaId()));
        Cuatrimestre cuatrimestre = cuatrimestreRepository.findById(request.getCuatrimestreId())
                .orElseThrow(() -> new CuatrimestreNotFoundException(request.getCuatrimestreId()));
        Profesor profesor = profesorRepository.findById(request.getProfesorId())
                .orElseThrow(() -> new ProfesorNotFoundException(request.getProfesorId()));

        comision.setNombre(request.getNombre());
        comision.setCupo(request.getCupo());
        comision.setActiva(request.isActiva());
        comision.setMateria(materia);
        comision.setCuatrimestre(cuatrimestre);
        comision.setProfesor(profesor);
    }

    private ComisionResponse toResponse(ComisionMateria comision) {
        Profesor profesor = comision.getProfesor();
        return ComisionResponse.builder()
                .id(comision.getId())
                .nombre(comision.getNombre())
                .cupo(comision.getCupo())
                .activa(comision.isActiva())
                .materiaId(comision.getMateria().getId())
                .materiaNombre(comision.getMateria().getNombre())
                .cuatrimestreId(comision.getCuatrimestre().getId())
                .cuatrimestreAnio(comision.getCuatrimestre().getAnio())
                .cuatrimestreNumero(comision.getCuatrimestre().getNumero())
                .profesorId(profesor.getId())
                .profesorNombre(profesor.getUser().getNombre())
                .profesorApellido(profesor.getUser().getApellido())
                .profesorTitulo(profesor.getTitulo())
                .build();
    }
}
