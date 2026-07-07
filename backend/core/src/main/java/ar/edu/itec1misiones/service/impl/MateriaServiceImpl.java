package ar.edu.itec1misiones.service.impl;

import ar.edu.itec1misiones.dto.request.MateriaRequest;
import ar.edu.itec1misiones.dto.response.MateriaResponse;
import ar.edu.itec1misiones.exception.MateriaNotFoundException;
import ar.edu.itec1misiones.model.Materia;
import ar.edu.itec1misiones.repository.MateriaRepository;
import ar.edu.itec1misiones.service.MateriaService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class MateriaServiceImpl implements MateriaService {

    private final MateriaRepository materiaRepository;

    public MateriaServiceImpl(MateriaRepository materiaRepository) {
        this.materiaRepository = materiaRepository;
    }

    @Override
    public MateriaResponse crear(MateriaRequest request) {
        Materia materia = new Materia();
        materia.setNombre(request.getNombre());
        materia.setCodigoInterno(request.getCodigoInterno());
        materia.setDescripcion(request.getDescripcion());
        materia.setActiva(true);

        return toResponse(materiaRepository.save(materia));
    }

    @Override
    @Transactional(readOnly = true)
    public List<MateriaResponse> listarActivas() {
        return materiaRepository.findByActivaTrue().stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public MateriaResponse buscarPorId(Long id) {
        return toResponse(materiaRepository.findById(id)
                .orElseThrow(() -> new MateriaNotFoundException(id)));
    }

    @Override
    public MateriaResponse actualizar(Long id, MateriaRequest request) {
        Materia materia = materiaRepository.findById(id)
                .orElseThrow(() -> new MateriaNotFoundException(id));

        materia.setNombre(request.getNombre());
        materia.setCodigoInterno(request.getCodigoInterno());
        materia.setDescripcion(request.getDescripcion());

        return toResponse(materiaRepository.save(materia));
    }

    @Override
    public void desactivar(Long id) {
        Materia materia = materiaRepository.findById(id)
                .orElseThrow(() -> new MateriaNotFoundException(id));
        materia.setActiva(false);
        materiaRepository.save(materia);
    }

    private MateriaResponse toResponse(Materia materia) {
        return MateriaResponse.builder()
                .id(materia.getId())
                .nombre(materia.getNombre())
                .codigoInterno(materia.getCodigoInterno())
                .descripcion(materia.getDescripcion())
                .activa(materia.isActiva())
                .build();
    }
}
