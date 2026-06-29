package ar.edu.itec1misiones.service.impl;

import ar.edu.itec1misiones.dto.request.ModuloHorarioRequest;
import ar.edu.itec1misiones.dto.response.ModuloHorarioResponse;
import ar.edu.itec1misiones.exception.ModuloHorarioNotFoundException;
import ar.edu.itec1misiones.model.ModuloHorario;
import ar.edu.itec1misiones.repository.ModuloHorarioRepository;
import ar.edu.itec1misiones.service.ModuloHorarioService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
public class ModuloHorarioServiceImpl implements ModuloHorarioService {

    private final ModuloHorarioRepository moduloHorarioRepository;

    @Override
    @Transactional(readOnly = true)
    public List<ModuloHorarioResponse> getAll() {
        return moduloHorarioRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public ModuloHorarioResponse getById(Long id) {
        return toResponse(moduloHorarioRepository.findById(id)
                .orElseThrow(() -> new ModuloHorarioNotFoundException(id)));
    }

    @Override
    public ModuloHorarioResponse create(ModuloHorarioRequest request) {
        ModuloHorario modulo = new ModuloHorario();
        mapFromRequest(modulo, request);
        return toResponse(moduloHorarioRepository.save(modulo));
    }

    @Override
    public ModuloHorarioResponse update(Long id, ModuloHorarioRequest request) {
        ModuloHorario modulo = moduloHorarioRepository.findById(id)
                .orElseThrow(() -> new ModuloHorarioNotFoundException(id));
        mapFromRequest(modulo, request);
        return toResponse(moduloHorarioRepository.save(modulo));
    }

    @Override
    public void delete(Long id) {
        if (!moduloHorarioRepository.existsById(id)) {
            throw new ModuloHorarioNotFoundException(id);
        }
        moduloHorarioRepository.deleteById(id);
    }

    private void mapFromRequest(ModuloHorario modulo, ModuloHorarioRequest request) {
        modulo.setNumero(request.getNumero());
        modulo.setHoraInicio(request.getHoraInicio());
        modulo.setHoraFin(request.getHoraFin());
    }

    private ModuloHorarioResponse toResponse(ModuloHorario modulo) {
        return ModuloHorarioResponse.builder()
                .id(modulo.getId())
                .numero(modulo.getNumero())
                .horaInicio(modulo.getHoraInicio())
                .horaFin(modulo.getHoraFin())
                .build();
    }
}
