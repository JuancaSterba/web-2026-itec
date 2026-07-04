package ar.edu.itec1misiones.notas.controller;

import ar.edu.itec1misiones.notas.dto.ExamenRequest;
import ar.edu.itec1misiones.notas.model.Examen;
import ar.edu.itec1misiones.notas.service.ExamenService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/examenes")
public class ExamenController {

    private final ExamenService examenService;

    public ExamenController(ExamenService examenService) {
        this.examenService = examenService;
    }

    @PostMapping
    public ResponseEntity<Examen> crear(@RequestBody @Valid ExamenRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(examenService.crear(request));
    }

    @GetMapping
    public ResponseEntity<List<Examen>> listar() {
        return ResponseEntity.ok(examenService.listar());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Examen> actualizar(@PathVariable Long id, @RequestBody @Valid ExamenRequest request) {
        return ResponseEntity.ok(examenService.actualizar(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        examenService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
