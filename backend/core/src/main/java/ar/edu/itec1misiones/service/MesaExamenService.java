package ar.edu.itec1misiones.service;

import ar.edu.itec1misiones.dto.request.InscripcionMesaRequest;
import ar.edu.itec1misiones.dto.request.MesaExamenRequest;
import ar.edu.itec1misiones.dto.request.MesaExamenUpdateRequest;
import ar.edu.itec1misiones.dto.response.InscripcionMesaResponse;
import ar.edu.itec1misiones.dto.response.MesaExamenResponse;

import java.util.List;

public interface MesaExamenService {
    MesaExamenResponse crear(MesaExamenRequest request);
    List<MesaExamenResponse> buscarTodas();
    List<MesaExamenResponse> buscarPorTribunal(Long tribunalUserId);
    MesaExamenResponse buscarPorId(Long id);
    MesaExamenResponse actualizarTribunal(Long id, MesaExamenUpdateRequest request);
    InscripcionMesaResponse inscribirAlumno(Long mesaExamenId, InscripcionMesaRequest request);
    List<InscripcionMesaResponse> listarInscripciones(Long mesaExamenId);
}
