package ar.edu.itec1misiones.config;

import ar.edu.itec1misiones.model.*;
import ar.edu.itec1misiones.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Set;

@Slf4j
@Component
@Profile("dev")
@RequiredArgsConstructor
public class DatabaseSeeder implements CommandLineRunner {

    private final CarreraRepository carreraRepository;
    private final PlanEstudioRepository planEstudioRepository;
    private final MateriaRepository materiaRepository;
    private final ProfesorRepository profesorRepository;
    private final AlumnoRepository alumnoRepository;
    private final ComisionMateriaRepository comisionMateriaRepository;
    private final CuatrimestreRepository cuatrimestreRepository;
    private final CoreUserRepository userRepository;

    @Override
    public void run(String... args) {
        if (carreraRepository.count() > 0) {
            log.info("[Seeder] Base de datos ya inicializada, omitiendo seed.");
            return;
        }

        log.info("[Seeder] Inicializando datos de desarrollo...");

        // --- Carrera ---
        Carrera carrera = new Carrera();
        carrera.setNombre("Desarrollo de Software");
        carrera.setDescripcion("Tecnicatura Superior en Desarrollo de Software");
        carrera.setResolucion("RES-001/2024");
        carrera.setActiva(true);
        carrera = carreraRepository.save(carrera);

        // --- Plan de Estudio ---
        PlanEstudio plan = new PlanEstudio();
        plan.setValidez("2024-2030");
        plan.setResolucion("PLAN-001/2024");
        plan.setFechaInicio(LocalDate.of(2024, 3, 1));
        plan.setFechaFin(LocalDate.of(2030, 12, 31));
        plan.setActivo(true);
        plan.setCarrera(carrera);
        plan = planEstudioRepository.save(plan);

        // --- Materias ---
        Materia prog1 = new Materia();
        prog1.setNombre("Programación 1");
        prog1.setCargaHoraria(96);
        prog1.setAnio(1);
        prog1.setCuatrimestre(1);
        prog1.setActiva(true);
        prog1.setPlanEstudio(plan);
        materiaRepository.save(prog1);

        Materia baseDatos = new Materia();
        baseDatos.setNombre("Base de Datos");
        baseDatos.setCargaHoraria(80);
        baseDatos.setAnio(1);
        baseDatos.setCuatrimestre(2);
        baseDatos.setActiva(true);
        baseDatos.setPlanEstudio(plan);
        baseDatos = materiaRepository.save(baseDatos);

        // --- User Profesor ---
        User userProfesor = new User();
        userProfesor.setUsername("profesor.dev");
        // Nota: Usamos {noop} para indicarle al DelegatingPasswordEncoder de Spring Security 
        // que esta contraseña está en texto plano y no debe intentar deshashearla con BCrypt. 
        // Ideal para dev/tests rápidos sin consumir CPU hasheando contraseñas descartables.
        userProfesor.setPassword("{noop}dev1234");
        userProfesor.setNombre("Carlos");
        userProfesor.setApellido("García");
        userProfesor.setDni("30000001");
        userProfesor.setEmail("carlos.garcia@itec.edu.ar");
        userProfesor.setTelefono("3764000001");
        userProfesor.setRoles(Set.of(Rol.PROFESOR));
        userProfesor = userRepository.save(userProfesor);

        // --- Profesor ---
        Profesor profesor = new Profesor();
        profesor.setUser(userProfesor);
        profesor.setTitulo("Lic. en Sistemas");
        profesor.setTelefonoContacto("3764000001");
        profesor.setActivo(true);
        profesor = profesorRepository.save(profesor);

        // --- User Alumno ---
        User userAlumno = new User();
        userAlumno.setUsername("alumno.dev");
        // Contraseña en texto plano para desarrollo
        userAlumno.setPassword("{noop}dev1234");
        userAlumno.setNombre("Ana");
        userAlumno.setApellido("López");
        userAlumno.setDni("40000001");
        userAlumno.setEmail("ana.lopez@itec.edu.ar");
        userAlumno.setTelefono("3764000002");
        userAlumno.setRoles(Set.of(Rol.ALUMNO));
        userAlumno = userRepository.save(userAlumno);

        // --- Alumno ---
        Alumno alumno = new Alumno();
        alumno.setUser(userAlumno);
        alumno.setLegajo("2024-0001");
        alumno.setActivo(true);
        alumnoRepository.save(alumno);

        // --- Cuatrimestre ---
        Cuatrimestre cuatrimestre = new Cuatrimestre();
        cuatrimestre.setAnio(2024);
        cuatrimestre.setNumero(1);
        cuatrimestre.setFechaInicio(LocalDate.of(2024, 3, 1));
        cuatrimestre.setFechaFin(LocalDate.of(2024, 7, 31));
        cuatrimestre.setActual(true);
        cuatrimestre = cuatrimestreRepository.save(cuatrimestre);

        // --- Comisión ---
        ComisionMateria comision = new ComisionMateria();
        comision.setNombre("Base de Datos - Comisión A");
        comision.setCupo(30);
        comision.setActiva(true);
        comision.setMateria(baseDatos);
        comision.setCuatrimestre(cuatrimestre);
        comision.setProfesor(profesor);
        comisionMateriaRepository.save(comision);

        log.info("[Seeder] Datos de desarrollo insertados correctamente.");
    }
}
