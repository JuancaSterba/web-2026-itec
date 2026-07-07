package ar.edu.itec1misiones.service;

import ar.edu.itec1misiones.dto.request.CicloLectivoRequest;
import ar.edu.itec1misiones.dto.response.CicloLectivoResponse;

import java.util.List;

public interface CicloLectivoService {
    CicloLectivoResponse guardar(CicloLectivoRequest request);
    List<CicloLectivoResponse> buscarTodos();
    CicloLectivoResponse buscarPorId(Long id);
}
