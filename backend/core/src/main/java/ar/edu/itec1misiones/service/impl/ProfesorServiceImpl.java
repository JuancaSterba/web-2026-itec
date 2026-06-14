package ar.edu.itec1misiones.service.impl;

import ar.edu.itec1misiones.model.Profesor;
import ar.edu.itec1misiones.model.User;
import ar.edu.itec1misiones.repository.ProfesorRepository;
import ar.edu.itec1misiones.service.ProfesorService;
import org.springframework.stereotype.Service;

@Service
public class ProfesorServiceImpl implements ProfesorService {

    private final ProfesorRepository profesorRepository;

    public ProfesorServiceImpl(ProfesorRepository profesorRepository) {
        this.profesorRepository = profesorRepository;
    }

    @Override
    public void crearProfesorConUsuario(User user) {
        if (user.getDni() == null || user.getEmail() == null || user.getTelefono() == null) {
            throw new IllegalArgumentException("Faltan datos personales requeridos");
        }

        Profesor profesor = new Profesor();
        profesor.setUser(user);

        profesorRepository.save(profesor);
    }
}
