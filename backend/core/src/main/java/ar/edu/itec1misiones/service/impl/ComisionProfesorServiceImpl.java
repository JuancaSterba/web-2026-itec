package ar.edu.itec1misiones.service.impl;

import ar.edu.itec1misiones.dto.request.ComisionProfesorRequest;
import ar.edu.itec1misiones.dto.response.ComisionProfesorResponse;
import ar.edu.itec1misiones.exception.ComisionNotFoundException;
import ar.edu.itec1misiones.exception.ComisionProfesorNotFoundException;
import ar.edu.itec1misiones.exception.ProfesorNotFoundException;
import ar.edu.itec1misiones.model.Comision;
import ar.edu.itec1misiones.model.ComisionProfesor;
import ar.edu.itec1misiones.model.Profesor;
import ar.edu.itec1misiones.repository.ComisionProfesorRepository;
import ar.edu.itec1misiones.repository.ComisionRepository;
import ar.edu.itec1misiones.repository.ProfesorRepository;
import ar.edu.itec1misiones.service.ComisionProfesorService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
public class ComisionProfesorServiceImpl implements ComisionProfesorService {

    private final ComisionProfesorRepository comisionProfesorRepository;
    private final ComisionRepository comisionRepository;
    private final ProfesorRepository profesorRepository;

    @Override
    public ComisionProfesorResponse guardar(ComisionProfesorRequest request) {
        Comision comision = comisionRepository.findById(request.getComisionId())
                .orElseThrow(() -> new ComisionNotFoundException(request.getComisionId()));
        Profesor profesor = profesorRepository.findById(request.getProfesorId())
                .orElseThrow(() -> new ProfesorNotFoundException(request.getProfesorId()));

        if (comisionProfesorRepository.existsByComisionIdAndProfesorId(comision.getId(), profesor.getId())) {
            throw new IllegalArgumentException("El profesor ya está asignado a esta comisión");
        }

        ComisionProfesor comisionProfesor = new ComisionProfesor();
        comisionProfesor.setComision(comision);
        comisionProfesor.setProfesor(profesor);
        comisionProfesor.setRol(request.getRol());

        return toResponse(comisionProfesorRepository.save(comisionProfesor));
    }

    @Override
    @Transactional(readOnly = true)
    public List<ComisionProfesorResponse> buscarTodos() {
        return comisionProfesorRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public ComisionProfesorResponse buscarPorId(Long id) {
        return toResponse(comisionProfesorRepository.findById(id)
                .orElseThrow(() -> new ComisionProfesorNotFoundException(id)));
    }

    private ComisionProfesorResponse toResponse(ComisionProfesor comisionProfesor) {
        return ComisionProfesorResponse.builder()
                .id(comisionProfesor.getId())
                .comisionId(comisionProfesor.getComision().getId())
                .profesorId(comisionProfesor.getProfesor().getId())
                .rol(comisionProfesor.getRol())
                .build();
    }
}
