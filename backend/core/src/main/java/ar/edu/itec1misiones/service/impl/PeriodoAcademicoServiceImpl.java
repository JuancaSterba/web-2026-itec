package ar.edu.itec1misiones.service.impl;

import ar.edu.itec1misiones.dto.request.PeriodoAcademicoRequest;
import ar.edu.itec1misiones.dto.response.PeriodoAcademicoResponse;
import ar.edu.itec1misiones.exception.CicloLectivoNotFoundException;
import ar.edu.itec1misiones.exception.PeriodoAcademicoNotFoundException;
import ar.edu.itec1misiones.model.CicloLectivo;
import ar.edu.itec1misiones.model.PeriodoAcademico;
import ar.edu.itec1misiones.repository.CicloLectivoRepository;
import ar.edu.itec1misiones.repository.PeriodoAcademicoRepository;
import ar.edu.itec1misiones.service.PeriodoAcademicoService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
public class PeriodoAcademicoServiceImpl implements PeriodoAcademicoService {

    private final PeriodoAcademicoRepository periodoAcademicoRepository;
    private final CicloLectivoRepository cicloLectivoRepository;

    @Override
    public PeriodoAcademicoResponse guardar(PeriodoAcademicoRequest request) {
        CicloLectivo ciclo = cicloLectivoRepository.findById(request.getCicloLectivoId())
                .orElseThrow(() -> new CicloLectivoNotFoundException(request.getCicloLectivoId()));

        PeriodoAcademico periodo = new PeriodoAcademico();
        periodo.setNombre(request.getNombre());
        periodo.setFechaInicio(request.getFechaInicio());
        periodo.setFechaFin(request.getFechaFin());
        periodo.setCicloLectivo(ciclo);

        return toResponse(periodoAcademicoRepository.save(periodo));
    }

    @Override
    @Transactional(readOnly = true)
    public List<PeriodoAcademicoResponse> buscarTodos() {
        return periodoAcademicoRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public PeriodoAcademicoResponse buscarPorId(Long id) {
        return toResponse(periodoAcademicoRepository.findById(id)
                .orElseThrow(() -> new PeriodoAcademicoNotFoundException(id)));
    }

    @Override
    public PeriodoAcademicoResponse actualizar(Long id, PeriodoAcademicoRequest request) {
        PeriodoAcademico periodo = periodoAcademicoRepository.findById(id)
                .orElseThrow(() -> new PeriodoAcademicoNotFoundException(id));
        CicloLectivo ciclo = cicloLectivoRepository.findById(request.getCicloLectivoId())
                .orElseThrow(() -> new CicloLectivoNotFoundException(request.getCicloLectivoId()));

        periodo.setNombre(request.getNombre());
        periodo.setFechaInicio(request.getFechaInicio());
        periodo.setFechaFin(request.getFechaFin());
        periodo.setCicloLectivo(ciclo);

        return toResponse(periodoAcademicoRepository.save(periodo));
    }

    @Override
    public void eliminar(Long id) {
        PeriodoAcademico periodo = periodoAcademicoRepository.findById(id)
                .orElseThrow(() -> new PeriodoAcademicoNotFoundException(id));
        periodoAcademicoRepository.delete(periodo);
    }

    private PeriodoAcademicoResponse toResponse(PeriodoAcademico periodo) {
        return PeriodoAcademicoResponse.builder()
                .id(periodo.getId())
                .nombre(periodo.getNombre())
                .fechaInicio(periodo.getFechaInicio())
                .fechaFin(periodo.getFechaFin())
                .cicloLectivoId(periodo.getCicloLectivo().getId())
                .build();
    }
}
