package ar.edu.itec1misiones.service;

import ar.edu.itec1misiones.dto.request.ModuloHorarioRequest;
import ar.edu.itec1misiones.dto.response.ModuloHorarioResponse;

import java.util.List;

public interface ModuloHorarioService {
    List<ModuloHorarioResponse> getAll();
    ModuloHorarioResponse getById(Long id);
    ModuloHorarioResponse create(ModuloHorarioRequest request);
    ModuloHorarioResponse update(Long id, ModuloHorarioRequest request);
    void delete(Long id);
}
