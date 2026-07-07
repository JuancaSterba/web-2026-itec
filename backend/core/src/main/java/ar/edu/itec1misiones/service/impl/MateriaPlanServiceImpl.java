package ar.edu.itec1misiones.service.impl;

import ar.edu.itec1misiones.dto.request.MateriaPlanRequest;
import ar.edu.itec1misiones.dto.response.MateriaPlanResponse;
import ar.edu.itec1misiones.exception.MateriaNotFoundException;
import ar.edu.itec1misiones.exception.MateriaPlanNotFoundException;
import ar.edu.itec1misiones.exception.PlanEstudioNotFoundException;
import ar.edu.itec1misiones.model.Materia;
import ar.edu.itec1misiones.model.MateriaPlan;
import ar.edu.itec1misiones.model.PlanEstudio;
import ar.edu.itec1misiones.repository.MateriaPlanRepository;
import ar.edu.itec1misiones.repository.MateriaRepository;
import ar.edu.itec1misiones.repository.PlanEstudioRepository;
import ar.edu.itec1misiones.service.MateriaPlanService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
public class MateriaPlanServiceImpl implements MateriaPlanService {

    private final MateriaPlanRepository materiaPlanRepository;
    private final PlanEstudioRepository planEstudioRepository;
    private final MateriaRepository materiaRepository;

    @Override
    public MateriaPlanResponse guardar(MateriaPlanRequest request) {
        PlanEstudio planEstudio = planEstudioRepository.findById(request.getPlanEstudioId())
                .orElseThrow(() -> new PlanEstudioNotFoundException(request.getPlanEstudioId()));
        Materia materia = materiaRepository.findById(request.getMateriaId())
                .orElseThrow(() -> new MateriaNotFoundException(request.getMateriaId()));

        MateriaPlan materiaPlan = new MateriaPlan();
        materiaPlan.setPlanEstudio(planEstudio);
        materiaPlan.setMateria(materia);
        materiaPlan.setCuatrimestreDictado(request.getCuatrimestreDictado());
        materiaPlan.setCargaHoraria(request.getCargaHoraria());

        return toResponse(materiaPlanRepository.save(materiaPlan));
    }

    @Override
    @Transactional(readOnly = true)
    public List<MateriaPlanResponse> buscarTodos() {
        return materiaPlanRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public MateriaPlanResponse buscarPorId(Long id) {
        return toResponse(materiaPlanRepository.findById(id)
                .orElseThrow(() -> new MateriaPlanNotFoundException(id)));
    }

    private MateriaPlanResponse toResponse(MateriaPlan materiaPlan) {
        return MateriaPlanResponse.builder()
                .id(materiaPlan.getId())
                .planEstudioId(materiaPlan.getPlanEstudio().getId())
                .materiaId(materiaPlan.getMateria().getId())
                .materiaNombre(materiaPlan.getMateria().getNombre())
                .cuatrimestreDictado(materiaPlan.getCuatrimestreDictado())
                .cargaHoraria(materiaPlan.getCargaHoraria())
                .build();
    }
}
