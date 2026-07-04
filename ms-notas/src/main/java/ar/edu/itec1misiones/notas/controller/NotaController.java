package ar.edu.itec1misiones.notas.controller;

import ar.edu.itec1misiones.notas.dto.NotaRequest;
import ar.edu.itec1misiones.notas.model.Nota;
import ar.edu.itec1misiones.notas.service.NotaService;
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
@RequestMapping("/api/notas")
public class NotaController {

    private final NotaService notaService;

    public NotaController(NotaService notaService) {
        this.notaService = notaService;
    }

    @PostMapping
    public ResponseEntity<Nota> crear(@RequestBody @Valid NotaRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(notaService.crear(request));
    }

    @GetMapping
    public ResponseEntity<List<Nota>> listar() {
        return ResponseEntity.ok(notaService.listar());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Nota> actualizar(@PathVariable Long id, @RequestBody @Valid NotaRequest request) {
        return ResponseEntity.ok(notaService.actualizar(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        notaService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
