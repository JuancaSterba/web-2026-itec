package ar.edu.itec1misiones.service;

import ar.edu.itec1misiones.dto.request.HorarioClaseRequest;
import ar.edu.itec1misiones.dto.response.HorarioClaseResponse;

import java.util.List;

public interface HorarioClaseService {
    List<HorarioClaseResponse> getAll();
    HorarioClaseResponse getById(Long id);
    HorarioClaseResponse create(HorarioClaseRequest request);
    HorarioClaseResponse update(Long id, HorarioClaseRequest request);
    void delete(Long id);
    List<HorarioClaseResponse> getByComisionId(Long comisionId);
}
