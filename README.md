# Sistema de Controle de Estoque de Produtos

Sistema fullstack para gerenciamento de estoque de produtos, permitindo registrar movimentações de entrada e saída de mercadorias, acompanhar o saldo em tempo real e visualizar o histórico de movimentações.

## Tecnologias Utilizadas

### Backend
- **Java 26**
- **Spring Boot 4.1.1**
- **Gradle** (wrapper incluso no projeto)
- **Lombok** (redução de boilerplate)
- **Jackson** (manipulação de JSON)
- **Arquitetura**: REST API com persistência em arquivos JSON (sem banco de dados)

### Frontend
- **React 19**
- **Vite 8** (build tool / dev server)
- **CSS puro** com efeitos de glassmorphism
- **Fonte**: Inter (Google Fonts)

### Persistência
- Os dados são armazenados em arquivos JSON na pasta `BackEnd/data/`:
  - `estoque.json` — lista de produtos e seus estoques
  - `movimentacoes.json` — histórico de movimentações

## Estrutura do Projeto

```
Sistema_EstoqueDeProdutos/
├── BackEnd/
│   ├── data/
│   │   ├── estoque.json          # Produtos cadastrados
│   │   └── movimentacoes.json    # Histórico de movimentações
│   ├── src/main/java/BackEnd/demo/
│   │   ├── config/
│   │   │   └── CorsConfig.java   # Configuração de CORS
│   │   ├── controller/
│   │   │   └── EstoqueController.java   # Endpoints REST
│   │   ├── dto/
│   │   │   └── MovimentacaoRequest.java # DTO de requisição
│   │   ├── model/
│   │   │   ├── Movimentacao.java
│   │   │   └── Produto.java
│   │   ├── service/
│   │   │   └── EstoqueService.java      # Lógica de negócio
│   │   └── DemoApplication.java         # Classe principal
│   ├── build.gradle
│   └── gradlew / gradlew.bat
└── FrontEnd/
    ├── src/
    │   ├── App.jsx               # Componente principal
    │   ├── App.css               # Estilos (glassmorphism)
    │   ├── index.css
    │   └── main.jsx
    ├── index.html
    ├── package.json
    └── vite.config.js
```

## Pré-requisitos

- **Java 26** (JDK 26) — [download](https://www.oracle.com/java/technologies/downloads/)
- **Node.js 24+** (com npm) — [download](https://nodejs.org/)

## Como Rodar

### 1. Backend (Spring Boot)

O backend roda na porta **8081**.

```bash
cd BackEnd
./gradlew bootRun          # Linux / macOS
gradlew.bat bootRun        # Windows
```

Aguarde a mensagem:
```
Tomcat started on port 8081 (http)
Started DemoApplication in X.XXX seconds
```

### 2. Frontend (React + Vite)

O frontend roda na porta **5173** (ou próxima disponível).

```bash
cd FrontEnd
npm install      # apenas na primeira vez
npm run dev
```

Abra o navegador no endereço exibido no terminal (ex.: `http://localhost:5173`).

## Endpoints da API

Base URL: `http://localhost:8081/api`

| Método | Endpoint            | Descrição                              |
|--------|---------------------|----------------------------------------|
| GET    | `/produtos`         | Lista todos os produtos e seus estoques |
| GET    | `/movimentacoes`    | Lista todas as movimentações           |
| POST   | `/movimentacoes`    | Registra uma nova movimentação         |

### Exemplo de requisição POST

```json
{
  "codigoProduto": 101,
  "tipo": "ENTRADA",
  "descricao": "Entradas",
  "quantidade": 50
}
```

### Exemplo de resposta (201 Created)

```json
{
  "id": 3,
  "codigoProduto": 101,
  "descricaoProduto": "Caneta Azul",
  "tipo": "ENTRADA",
  "descricao": "Entradas",
  "quantidade": 50,
  "estoqueAnterior": 100,
  "estoqueFinal": 150,
  "dataHora": "2026-10-14T10:00:00"
}
```

## Tipos de Movimentação

O campo **Descrição** é um enum com as seguintes opções. Ao selecionar uma, o tipo (Entrada/Saída) é definido automaticamente:

| Tipo                | Descrição                                                        | Efeito no estoque |
|---------------------|------------------------------------------------------------------|-------------------|
| Entradas            | Produtos recebidos de fornecedores.                              | Entrada (+)       |
| Vendas              | Produtos vendidos aos clientes.                                  | Saída (−)         |
| Avarias             | Produtos danificados ou quebrados.                               | Saída (−)         |
| Perdas              | Produtos extraviados, vencidos ou inutilizados.                  | Saída (−)         |
| Devoluções          | Produtos devolvidos por clientes ou ao fornecedor.               | Entrada (+)       |
| Trocas              | Produtos substituídos por outros.                                | Entrada (+)       |
| Transferências      | Produtos enviados para outra loja ou estoque.                    | Saída (−)         |
| Consumo interno     | Produtos utilizados pela própria empresa.                        | Saída (−)         |
| Ajustes de estoque  | Correções de diferenças entre o estoque físico e o sistema.     | Entrada (+)       |
| Inventário          | Contagem física dos produtos para conferir as quantidades.       | Entrada (+)       |
| Ruptura             | Quando um produto está em falta no estoque.                      | Saída (−)         |
| Saldo de estoque    | Quantidade de produtos disponíveis no momento.                   | Entrada (+)       |

> O usuário pode alterar manualmente o tipo (Entrada/Saída) se necessário.

## Funcionalidades

- Listagem de produtos com indicador de nível de estoque (baixo, médio, alto)
- Dashboard com estatísticas: total de produtos, estoque total, entradas e saídas do dia
- Registro de movimentações com seleção de tipo (enum) e descrição explicativa
- Cálculo automático do estoque anterior e final
- Histórico de movimentações com filtro por tipo (Todos, Entradas, Saídas) e busca por produto, descrição ou ID
- Validação de estoque insuficiente para saídas
- Interface responsiva com design glassmorphism

## Observações

- **CORS**: O backend permite requisições das portas `5173`, `5174` e `5175` (localhost e 127.0.0.1). Caso o Vite use outra porta, adicione-a em `CorsConfig.java`.
- **Persistência**: Não há banco de dados. Os dados são lidos e escritos diretamente nos arquivos JSON em `BackEnd/data/`.
- **Spring DevTools**: O backend recarrega automaticamente ao detectar mudanças no código.
