package ar.edu.itec1misiones.service.impl;

import ar.edu.itec1misiones.model.Alumno;
import ar.edu.itec1misiones.model.User;
import ar.edu.itec1misiones.repository.AlumnoRepository;
import ar.edu.itec1misiones.service.AlumnoService;
import org.springframework.stereotype.Service;

@Service
public class AlumnoServiceImpl implements AlumnoService {
    private final AlumnoRepository alumnoRepository;

    public AlumnoServiceImpl(AlumnoRepository alumnoRepository) {
        this.alumnoRepository = alumnoRepository;
    }

    @Override
    public void crearAlumnoConUsuario(User user) {
        // Validaciones por campos únicos en la tabla usuarios
        if (user.getDni() == null || user.getEmail() == null || user.getTelefono() == null) {
            throw new IllegalArgumentException("Faltan datos personales requeridos");
        }

        // Crear el alumno
        Alumno alumno = new Alumno();
        alumno.setUser(user);

        alumnoRepository.save(alumno);
    }


}
