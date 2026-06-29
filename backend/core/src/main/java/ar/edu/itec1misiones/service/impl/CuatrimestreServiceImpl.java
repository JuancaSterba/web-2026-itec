package ar.edu.itec1misiones.service.impl;

import ar.edu.itec1misiones.dto.request.CuatrimestreRequest;
import ar.edu.itec1misiones.dto.response.CuatrimestreResponse;
import ar.edu.itec1misiones.exception.CuatrimestreNotFoundException;
import ar.edu.itec1misiones.model.Cuatrimestre;
import ar.edu.itec1misiones.repository.CuatrimestreRepository;
import ar.edu.itec1misiones.service.CuatrimestreService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class CuatrimestreServiceImpl implements CuatrimestreService {

    private final CuatrimestreRepository cuatrimestreRepository;

    public CuatrimestreServiceImpl(CuatrimestreRepository cuatrimestreRepository) {
        this.cuatrimestreRepository = cuatrimestreRepository;
    }

    @Override
    public CuatrimestreResponse crear(CuatrimestreRequest request) {
        validarFechas(request);

        if (cuatrimestreRepository.existsByAnioAndNumero(request.getAnio(), request.getNumero())) {
            throw new IllegalArgumentException(
                    "Ya existe el cuatrimestre " + request.getNumero() + "/" + request.getAnio());
        }

        Cuatrimestre cuatrimestre = new Cuatrimestre();
        mapearDesdeRequest(cuatrimestre, request);
        Cuatrimestre guardado = cuatrimestreRepository.save(cuatrimestre);

        if (request.isActual()) {
            desmarcarActualExcepto(guardado.getId());
        }

        return toResponse(guardado);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CuatrimestreResponse> listarTodos() {
        return cuatrimestreRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public CuatrimestreResponse buscarPorId(Long id) {
        return toResponse(cuatrimestreRepository.findById(id)
                .orElseThrow(() -> new CuatrimestreNotFoundException(id)));
    }

    @Override
    @Transactional(readOnly = true)
    public CuatrimestreResponse buscarActual() {
        return toResponse(cuatrimestreRepository.findByActualTrue()
                .orElseThrow(() -> new CuatrimestreNotFoundException(
                        "No hay un cuatrimestre actual configurado")));
    }

    @Override
    public CuatrimestreResponse actualizar(Long id, CuatrimestreRequest request) {
        validarFechas(request);

        Cuatrimestre cuatrimestre = cuatrimestreRepository.findById(id)
                .orElseThrow(() -> new CuatrimestreNotFoundException(id));

        if (cuatrimestreRepository.existsByAnioAndNumeroAndIdNot(
                request.getAnio(), request.getNumero(), id)) {
            throw new IllegalArgumentException(
                    "Ya existe el cuatrimestre " + request.getNumero() + "/" + request.getAnio());
        }

        mapearDesdeRequest(cuatrimestre, request);
        Cuatrimestre guardado = cuatrimestreRepository.save(cuatrimestre);

        if (request.isActual()) {
            desmarcarActualExcepto(guardado.getId());
        }

        return toResponse(guardado);
    }

    @Override
    public void eliminar(Long id) {
        if (!cuatrimestreRepository.existsById(id)) {
            throw new CuatrimestreNotFoundException(id);
        }
        cuatrimestreRepository.deleteById(id);
    }

    private void desmarcarActualExcepto(Long idActual) {
        cuatrimestreRepository.findByActualTrue().ifPresent(anterior -> {
            if (!anterior.getId().equals(idActual)) {
                anterior.setActual(false);
                cuatrimestreRepository.save(anterior);
            }
        });
    }

    private void validarFechas(CuatrimestreRequest request) {
        if (request.getFechaFin().isBefore(request.getFechaInicio())) {
            throw new IllegalArgumentException(
                    "La fecha de fin no puede ser anterior a la fecha de inicio");
        }
    }

    private void mapearDesdeRequest(Cuatrimestre cuatrimestre, CuatrimestreRequest request) {
        cuatrimestre.setAnio(request.getAnio());
        cuatrimestre.setNumero(request.getNumero());
        cuatrimestre.setFechaInicio(request.getFechaInicio());
        cuatrimestre.setFechaFin(request.getFechaFin());
        cuatrimestre.setActual(request.isActual());
    }

    private CuatrimestreResponse toResponse(Cuatrimestre cuatrimestre) {
        return CuatrimestreResponse.builder()
                .id(cuatrimestre.getId())
                .anio(cuatrimestre.getAnio())
                .numero(cuatrimestre.getNumero())
                .fechaInicio(cuatrimestre.getFechaInicio())
                .fechaFin(cuatrimestre.getFechaFin())
                .actual(cuatrimestre.isActual())
                .build();
    }
}
