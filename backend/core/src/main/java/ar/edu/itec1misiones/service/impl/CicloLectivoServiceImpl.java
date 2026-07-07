package ar.edu.itec1misiones.service.impl;

import ar.edu.itec1misiones.dto.request.CicloLectivoRequest;
import ar.edu.itec1misiones.dto.response.CicloLectivoResponse;
import ar.edu.itec1misiones.exception.CicloLectivoNotFoundException;
import ar.edu.itec1misiones.model.CicloLectivo;
import ar.edu.itec1misiones.repository.CicloLectivoRepository;
import ar.edu.itec1misiones.service.CicloLectivoService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
public class CicloLectivoServiceImpl implements CicloLectivoService {

    private final CicloLectivoRepository cicloLectivoRepository;

    @Override
    public CicloLectivoResponse guardar(CicloLectivoRequest request) {
        CicloLectivo ciclo = new CicloLectivo();
        ciclo.setAnio(request.getAnio());
        ciclo.setFechaInicio(request.getFechaInicio());
        ciclo.setFechaFin(request.getFechaFin());
        ciclo.setActivo(true);

        return toResponse(cicloLectivoRepository.save(ciclo));
    }

    @Override
    @Transactional(readOnly = true)
    public List<CicloLectivoResponse> buscarTodos() {
        return cicloLectivoRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public CicloLectivoResponse buscarPorId(Long id) {
        return toResponse(cicloLectivoRepository.findById(id)
                .orElseThrow(() -> new CicloLectivoNotFoundException(id)));
    }

    @Override
    public CicloLectivoResponse actualizar(Long id, CicloLectivoRequest request) {
        CicloLectivo ciclo = cicloLectivoRepository.findById(id)
                .orElseThrow(() -> new CicloLectivoNotFoundException(id));

        ciclo.setAnio(request.getAnio());
        ciclo.setFechaInicio(request.getFechaInicio());
        ciclo.setFechaFin(request.getFechaFin());

        return toResponse(cicloLectivoRepository.save(ciclo));
    }

    @Override
    public void desactivar(Long id) {
        CicloLectivo ciclo = cicloLectivoRepository.findById(id)
                .orElseThrow(() -> new CicloLectivoNotFoundException(id));
        ciclo.setActivo(false);
        cicloLectivoRepository.save(ciclo);
    }

    private CicloLectivoResponse toResponse(CicloLectivo ciclo) {
        return CicloLectivoResponse.builder()
                .id(ciclo.getId())
                .anio(ciclo.getAnio())
                .fechaInicio(ciclo.getFechaInicio())
                .fechaFin(ciclo.getFechaFin())
                .activo(ciclo.isActivo())
                .build();
    }
}
