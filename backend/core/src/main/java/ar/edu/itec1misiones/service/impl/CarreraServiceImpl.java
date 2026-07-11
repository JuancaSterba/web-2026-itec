package ar.edu.itec1misiones.service.impl;

import ar.edu.itec1misiones.dto.request.CarreraRequest;
import ar.edu.itec1misiones.dto.response.CarreraResponse;
import ar.edu.itec1misiones.exception.CarreraNotFoundException;
import ar.edu.itec1misiones.model.Carrera;
import ar.edu.itec1misiones.repository.CarreraRepository;
import ar.edu.itec1misiones.service.CarreraService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CarreraServiceImpl implements CarreraService {

    private final CarreraRepository carreraRepository;

    public CarreraServiceImpl(CarreraRepository carreraRepository) {
        this.carreraRepository = carreraRepository;
    }

    @Override
    public CarreraResponse crear(CarreraRequest request) {
        Carrera carrera = new Carrera();
        carrera.setNombre(request.getNombre());
        carrera.setResolucionMinisterial(request.getResolucionMinisterial());
        carrera.setCupoActual(request.getCupoActual());
        carrera.setActiva(true);
        return toResponse(carreraRepository.save(carrera));
    }

    @Override
    public List<CarreraResponse> listarActivas() {
        return carreraRepository.findByActivaTrue().stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public CarreraResponse buscarPorId(Long id) {
        return toResponse(carreraRepository.findById(id)
                .orElseThrow(() -> new CarreraNotFoundException(id)));
    }

    @Override
    public CarreraResponse actualizar(Long id, CarreraRequest request) {
        Carrera carrera = carreraRepository.findById(id)
                .orElseThrow(() -> new CarreraNotFoundException(id));
        carrera.setNombre(request.getNombre());
        carrera.setResolucionMinisterial(request.getResolucionMinisterial());
        carrera.setCupoActual(request.getCupoActual());
        return toResponse(carreraRepository.save(carrera));
    }

    @Override
    public void desactivar(Long id) {
        Carrera carrera = carreraRepository.findById(id)
                .orElseThrow(() -> new CarreraNotFoundException(id));
        carrera.setActiva(false);
        carreraRepository.save(carrera);
    }

    private CarreraResponse toResponse(Carrera carrera) {
        return CarreraResponse.builder()
                .id(carrera.getId())
                .nombre(carrera.getNombre())
                .resolucionMinisterial(carrera.getResolucionMinisterial())
                .cupoActual(carrera.getCupoActual())
                .activa(carrera.isActiva())
                .build();
    }
}
