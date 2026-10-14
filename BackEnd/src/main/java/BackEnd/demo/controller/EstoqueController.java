package BackEnd.demo.controller;

import java.io.IOException;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import BackEnd.demo.dto.MovimentacaoRequest;
import BackEnd.demo.model.Movimentacao;
import BackEnd.demo.model.Produto;
import BackEnd.demo.service.EstoqueService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class EstoqueController {

    private final EstoqueService estoqueService;

    @GetMapping("/produtos")
    public ResponseEntity<List<Produto>> listarProdutos() throws IOException {
        return ResponseEntity.ok(estoqueService.listarProdutos());
    }

    @GetMapping("/movimentacoes")
    public ResponseEntity<List<Movimentacao>> listarMovimentacoes() throws IOException {
        return ResponseEntity.ok(estoqueService.listarMovimentacoes());
    }

    @PostMapping("/movimentacoes")
    public ResponseEntity<Movimentacao> registrarMovimentacao(@Valid @RequestBody MovimentacaoRequest request)
            throws IOException {
        Movimentacao movimentacao = estoqueService.registrarMovimentacao(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(movimentacao);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> handleIllegalArgument(IllegalArgumentException e) {
        return ResponseEntity.badRequest().body(Map.of("erro", e.getMessage()));
    }

    @ExceptionHandler(IOException.class)
    public ResponseEntity<Map<String, String>> handleIOException(IOException e) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("erro", "Erro ao manipular arquivo JSON: " + e.getMessage()));
    }
}
