package BackEnd.demo.service;

import java.io.File;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.atomic.AtomicLong;

import org.springframework.stereotype.Service;

import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;

import BackEnd.demo.dto.MovimentacaoRequest;
import BackEnd.demo.model.Movimentacao;
import BackEnd.demo.model.Produto;

@Service
public class EstoqueService {

    private final ObjectMapper objectMapper;
    private final File estoqueFile;
    private final File movimentacoesFile;
    private final AtomicLong idGenerator = new AtomicLong(0);

    public EstoqueService(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;

        String dataDir = System.getProperty("user.dir") + File.separator + "data";
        new File(dataDir).mkdirs();
        this.estoqueFile = new File(dataDir, "estoque.json");
        this.movimentacoesFile = new File(dataDir, "movimentacoes.json");
    }

    @PostConstruct
    public void init() {
        try {
            if (!estoqueFile.exists()) {
                salvarProdutos(new ArrayList<>());
            }
            if (!movimentacoesFile.exists()) {
                salvarMovimentacoes(new ArrayList<>());
            }
            List<Movimentacao> movimentacoes = listarMovimentacoes();
            if (!movimentacoes.isEmpty()) {
                long maxId = movimentacoes.stream()
                        .mapToLong(Movimentacao::getId)
                        .max()
                        .orElse(0);
                idGenerator.set(maxId);
            }
        } catch (IOException e) {
            throw new RuntimeException("Erro ao inicializar arquivos JSON", e);
        }
    }

    public List<Produto> listarProdutos() throws IOException {
        if (!estoqueFile.exists()) {
            return new ArrayList<>();
        }
        return objectMapper.readValue(estoqueFile, new TypeReference<List<Produto>>() {});
    }

    public Produto buscarProdutoPorCodigo(Integer codigo) throws IOException {
        return listarProdutos().stream()
                .filter(p -> p.getCodigoProduto().equals(codigo))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Produto não encontrado: " + codigo));
    }

    private void salvarProdutos(List<Produto> produtos) throws IOException {
        objectMapper.writeValue(estoqueFile, produtos);
    }

    public List<Movimentacao> listarMovimentacoes() throws IOException {
        if (!movimentacoesFile.exists()) {
            return new ArrayList<>();
        }
        return objectMapper.readValue(movimentacoesFile, new TypeReference<List<Movimentacao>>() {});
    }

    private void salvarMovimentacoes(List<Movimentacao> movimentacoes) throws IOException {
        objectMapper.writeValue(movimentacoesFile, movimentacoes);
    }

    public Movimentacao registrarMovimentacao(MovimentacaoRequest request) throws IOException {
        if (!"ENTRADA".equalsIgnoreCase(request.getTipo()) && !"SAIDA".equalsIgnoreCase(request.getTipo())) {
            throw new IllegalArgumentException("Tipo de movimentação inválido. Use ENTRADA ou SAIDA.");
        }

        List<Produto> produtos = listarProdutos();
        Produto produto = produtos.stream()
                .filter(p -> p.getCodigoProduto().equals(request.getCodigoProduto()))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Produto não encontrado: " + request.getCodigoProduto()));

        int estoqueAnterior = produto.getEstoque();
        int novoEstoque;

        if ("ENTRADA".equalsIgnoreCase(request.getTipo())) {
            novoEstoque = estoqueAnterior + request.getQuantidade();
        } else {
            if (request.getQuantidade() > estoqueAnterior) {
                throw new IllegalArgumentException(
                        "Estoque insuficiente. Estoque atual: " + estoqueAnterior + ", quantidade solicitada: " + request.getQuantidade());
            }
            novoEstoque = estoqueAnterior - request.getQuantidade();
        }

        produto.setEstoque(novoEstoque);
        salvarProdutos(produtos);

        Movimentacao movimentacao = new Movimentacao();
        movimentacao.setId(idGenerator.incrementAndGet());
        movimentacao.setCodigoProduto(produto.getCodigoProduto());
        movimentacao.setDescricaoProduto(produto.getDescricaoProduto());
        movimentacao.setTipo(request.getTipo().toUpperCase());
        movimentacao.setDescricao(request.getDescricao());
        movimentacao.setQuantidade(request.getQuantidade());
        movimentacao.setEstoqueAnterior(estoqueAnterior);
        movimentacao.setEstoqueFinal(novoEstoque);
        movimentacao.setDataHora(LocalDateTime.now());

        List<Movimentacao> movimentacoes = listarMovimentacoes();
        movimentacoes.add(movimentacao);
        salvarMovimentacoes(movimentacoes);

        return movimentacao;
    }
}
