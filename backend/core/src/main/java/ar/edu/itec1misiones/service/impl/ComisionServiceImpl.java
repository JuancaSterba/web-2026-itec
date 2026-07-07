package ar.edu.itec1misiones.service.impl;

import ar.edu.itec1misiones.dto.request.ComisionRequest;
import ar.edu.itec1misiones.dto.response.ComisionResponse;
import ar.edu.itec1misiones.exception.ComisionNotFoundException;
import ar.edu.itec1misiones.exception.MateriaPlanNotFoundException;
import ar.edu.itec1misiones.exception.PeriodoAcademicoNotFoundException;
import ar.edu.itec1misiones.model.Comision;
import ar.edu.itec1misiones.model.MateriaPlan;
import ar.edu.itec1misiones.model.PeriodoAcademico;
import ar.edu.itec1misiones.repository.ComisionRepository;
import ar.edu.itec1misiones.repository.MateriaPlanRepository;
import ar.edu.itec1misiones.repository.PeriodoAcademicoRepository;
import ar.edu.itec1misiones.service.ComisionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
public class ComisionServiceImpl implements ComisionService {

    private final ComisionRepository comisionRepository;
    private final PeriodoAcademicoRepository periodoAcademicoRepository;
    private final MateriaPlanRepository materiaPlanRepository;

    @Override
    public ComisionResponse guardar(ComisionRequest request) {
        PeriodoAcademico periodo = periodoAcademicoRepository.findById(request.getPeriodoAcademicoId())
                .orElseThrow(() -> new PeriodoAcademicoNotFoundException(request.getPeriodoAcademicoId()));
        MateriaPlan materiaPlan = materiaPlanRepository.findById(request.getMateriaPlanId())
                .orElseThrow(() -> new MateriaPlanNotFoundException(request.getMateriaPlanId()));

        Comision comision = new Comision();
        comision.setNombreComision(request.getNombreComision());
        comision.setCupoMaximo(request.getCupoMaximo());
        comision.setPeriodoAcademico(periodo);
        comision.setMateriaPlan(materiaPlan);
        comision.setActiva(true);

        return toResponse(comisionRepository.save(comision));
    }

    @Override
    @Transactional(readOnly = true)
    public List<ComisionResponse> buscarTodos() {
        return comisionRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public ComisionResponse buscarPorId(Long id) {
        return toResponse(comisionRepository.findById(id)
                .orElseThrow(() -> new ComisionNotFoundException(id)));
    }

    private ComisionResponse toResponse(Comision comision) {
        return ComisionResponse.builder()
                .id(comision.getId())
                .nombreComision(comision.getNombreComision())
                .cupoMaximo(comision.getCupoMaximo())
                .activa(comision.isActiva())
                .periodoAcademicoId(comision.getPeriodoAcademico().getId())
                .materiaPlanId(comision.getMateriaPlan().getId())
                .build();
    }
}
