import { useState, useEffect, useMemo } from 'react'
import './App.css'

const API_URL = 'http://localhost:8081/api'

const TIPOS_MOVIMENTACAO = [
  { valor: 'Entradas', descricao: 'Produtos recebidos de fornecedores.', tipo: 'ENTRADA' },
  { valor: 'Vendas', descricao: 'Produtos vendidos aos clientes.', tipo: 'SAIDA' },
  { valor: 'Avarias', descricao: 'Produtos danificados ou quebrados.', tipo: 'SAIDA' },
  { valor: 'Perdas', descricao: 'Produtos extraviados, vencidos ou inutilizados.', tipo: 'SAIDA' },
  { valor: 'Devoluções', descricao: 'Produtos devolvidos por clientes ou ao fornecedor.', tipo: 'ENTRADA' },
  { valor: 'Trocas', descricao: 'Produtos substituídos por outros.', tipo: 'ENTRADA' },
  { valor: 'Transferências', descricao: 'Produtos enviados para outra loja ou estoque.', tipo: 'SAIDA' },
  { valor: 'Consumo interno', descricao: 'Produtos utilizados pela própria empresa.', tipo: 'SAIDA' },
  { valor: 'Ajustes de estoque', descricao: 'Correções de diferenças entre o estoque físico e o sistema.', tipo: 'ENTRADA' },
  { valor: 'Inventário', descricao: 'Contagem física dos produtos para conferir as quantidades.', tipo: 'ENTRADA' },
  { valor: 'Ruptura', descricao: 'Quando um produto está em falta no estoque.', tipo: 'SAIDA' },
  { valor: 'Saldo de estoque', descricao: 'Quantidade de produtos disponíveis no momento.', tipo: 'ENTRADA' }
]

function App() {
  const [produtos, setProdutos] = useState([])
  const [movimentacoes, setMovimentacoes] = useState([])
  const [form, setForm] = useState({
    codigoProduto: '',
    tipo: 'ENTRADA',
    descricao: '',
    quantidade: ''
  })
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')
  const [resultado, setResultado] = useState(null)
  const [filtroTipo, setFiltroTipo] = useState('TODOS')
  const [busca, setBusca] = useState('')

  const carregarDados = async () => {
    try {
      const [prodRes, movRes] = await Promise.all([
        fetch(`${API_URL}/produtos`),
        fetch(`${API_URL}/movimentacoes`)
      ])
      setProdutos(await prodRes.json())
      setMovimentacoes(await movRes.json())
    } catch (e) {
      setErro('Falha ao conectar com o servidor. Verifique se o backend está rodando.')
    }
  }

  useEffect(() => {
    carregarDados()
  }, [])

  const stats = useMemo(() => {
    const totalProdutos = produtos.length
    const totalEstoque = produtos.reduce((sum, p) => sum + p.estoque, 0)
    const hoje = new Date().toDateString()
    const entradasHoje = movimentacoes.filter(m =>
      m.tipo === 'ENTRADA' && new Date(m.dataHora).toDateString() === hoje
    ).reduce((sum, m) => sum + m.quantidade, 0)
    const saidasHoje = movimentacoes.filter(m =>
      m.tipo === 'SAIDA' && new Date(m.dataHora).toDateString() === hoje
    ).reduce((sum, m) => sum + m.quantidade, 0)
    return { totalProdutos, totalEstoque, entradasHoje, saidasHoje }
  }, [produtos, movimentacoes])

  const movimentacoesFiltradas = useMemo(() => {
    return movimentacoes
      .filter(m => filtroTipo === 'TODOS' || m.tipo === filtroTipo)
      .filter(m => busca === '' ||
        m.descricaoProduto.toLowerCase().includes(busca.toLowerCase()) ||
        m.descricao.toLowerCase().includes(busca.toLowerCase()) ||
        String(m.id).includes(busca))
      .slice()
      .reverse()
  }, [movimentacoes, filtroTipo, busca])

  const handleChange = (e) => {
    const { name, value } = e.target
    if (name === 'descricao') {
      const tipoInfo = TIPOS_MOVIMENTACAO.find(t => t.valor === value)
      setForm({ ...form, descricao: value, tipo: tipoInfo ? tipoInfo.tipo : form.tipo })
      return
    }
    setForm({ ...form, [name]: value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErro('')
    setResultado(null)
    setLoading(true)

    try {
      const res = await fetch(`${API_URL}/movimentacoes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          codigoProduto: parseInt(form.codigoProduto),
          tipo: form.tipo,
          descricao: form.descricao,
          quantidade: parseInt(form.quantidade)
        })
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.erro || 'Erro ao registrar movimentação')
      }

      setResultado(data)
      setForm({ codigoProduto: '', tipo: 'ENTRADA', descricao: '', quantidade: '' })
      carregarDados()
    } catch (e) {
      setErro(e.message)
    } finally {
      setLoading(false)
    }
  }

  const formatarData = (dataStr) => {
    if (!dataStr) return ''
    const data = new Date(dataStr)
    return data.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getNivelEstoque = (estoque) => {
    if (estoque <= 50) return 'baixo'
    if (estoque <= 100) return 'medio'
    return 'alto'
  }

  const produtoSelecionado = produtos.find(p => p.codigoProduto === parseInt(form.codigoProduto))
  const tipoSelecionado = TIPOS_MOVIMENTACAO.find(t => t.valor === form.descricao)

  return (
    <div className="app">
      <div className="bg-blur"></div>

      <header className="header">
        <div className="header-content">
          <div className="header-left">
            <div className="logo">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 7L12 2L21 7V17L12 22L3 17V7Z" stroke="currentColor" strokeWidth="1.5" />
                <path d="M3 7L12 12L21 7" stroke="currentColor" strokeWidth="1.5" />
                <path d="M12 12V22" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </div>
            <div>
              <h1>Controle de Estoque</h1>
              <p>Movimentações de entrada e saída de mercadorias</p>
            </div>
          </div>
          <button onClick={carregarDados} className="btn-refresh" title="Atualizar dados">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="1.5" />
              <path d="M21 3V9H15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </header>

      <div className="stats-grid">
        <div className="stat-card glass">
          <div className="stat-icon produtos-icon">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M20 7L12 3L4 7M20 7L12 11M20 7V17L12 21M12 11L4 7M12 11V21M4 7V17L12 21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.totalProdutos}</span>
            <span className="stat-label">Produtos</span>
          </div>
        </div>

        <div className="stat-card glass">
          <div className="stat-icon estoque-icon">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M9 17V7M9 7L5 11M9 7L13 11M15 17V13M15 13L19 9M15 13L11 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.totalEstoque.toLocaleString('pt-BR')}</span>
            <span className="stat-label">Estoque Total</span>
          </div>
        </div>

        <div className="stat-card glass">
          <div className="stat-icon entrada-icon">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M12 5V19M12 19L18 13M12 19L6 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="stat-info">
            <span className="stat-value verde">{stats.entradasHoje.toLocaleString('pt-BR')}</span>
            <span className="stat-label">Entradas Hoje</span>
          </div>
        </div>

        <div className="stat-card glass">
          <div className="stat-icon saida-icon">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M12 19V5M12 5L18 11M12 5L6 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="stat-info">
            <span className="stat-value vermelho">{stats.saidasHoje.toLocaleString('pt-BR')}</span>
            <span className="stat-label">Saídas Hoje</span>
          </div>
        </div>
      </div>

      {erro && (
        <div className="alert erro fade-in">
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M12 9V13M12 17H12.01M10.29 3.86L1.82 18C1.64537 18.3031 1.55257 18.6521 1.54989 19.007C1.5472 19.3619 1.63478 19.7093 1.80714 20.0112C1.9795 20.3132 2.23174 20.5606 2.53716 20.7321C2.84258 20.9036 3.18941 20.9916 3.542 21H20.46C20.8126 20.9916 21.1594 20.9036 21.4649 20.7321C21.7703 20.5606 22.0225 20.3132 22.1949 20.0112C22.3672 19.7093 22.4548 19.3619 22.4501 19.007C22.4474 18.6521 22.3546 18.3031 22.18 18L13.71 3.86C13.5285 3.55571 13.273 3.30573 12.9675 3.13691C12.662 2.96809 12.3159 2.88514 11.9635 2.89463C11.6111 2.90413 11.2681 3.00568 10.97 3.19L10.29 3.86Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span>{erro}</span>
        </div>
      )}

      {resultado && (
        <div className={`resultado-card fade-in ${resultado.tipo.toLowerCase()}`}>
          <div className="resultado-header">
            <div className="resultado-title">
              <span className={`badge ${resultado.tipo.toLowerCase()}`}>
                {resultado.tipo === 'ENTRADA' ? '↓ Entrada' : '↑ Saída'} #{resultado.id}
              </span>
              <span className="resultado-produto">{resultado.descricaoProduto}</span>
            </div>
            <button onClick={() => setResultado(null)} className="close-btn">&times;</button>
          </div>
          <div className="resultado-body">
            <div className="resultado-item">
              <span className="label">Quantidade</span>
              <span className="value">{resultado.quantidade} un.</span>
            </div>
            <div className="resultado-item">
              <span className="label">Estoque Anterior</span>
              <span className="value">{resultado.estoqueAnterior} un.</span>
            </div>
            <div className="resultado-item destaque">
              <span className="label">Estoque Final</span>
              <span className="value estoque-final">{resultado.estoqueFinal} un.</span>
            </div>
          </div>
        </div>
      )}

      <div className="grid">
        <section className="card glass">
          <div className="card-header">
            <h2>Produtos em Estoque</h2>
            <span className="card-badge">{produtos.length} itens</span>
          </div>
          <div className="produtos-list">
            {produtos.map((p) => {
              const nivel = getNivelEstoque(p.estoque)
              return (
                <div key={p.codigoProduto} className="produto-item">
                  <div className="produto-info">
                    <div className="produto-top">
                      <span className="nome">{p.descricaoProduto}</span>
                      <span className={`nivel-estoque ${nivel}`}>
                        {nivel === 'baixo' ? 'Estoque baixo' : nivel === 'medio' ? 'Estoque médio' : 'Estoque alto'}
                      </span>
                    </div>
                    <span className="codigo">Código #{p.codigoProduto}</span>
                    <div className="estoque-bar">
                      <div
                        className={`estoque-bar-fill ${nivel}`}
                        style={{ width: `${Math.min(p.estoque / 3, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="estoque-info">
                    <span className="estoque-numero">{p.estoque}</span>
                    <span className="estoque-unidade">un.</span>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        <section className="card glass">
          <div className="card-header">
            <h2>Nova Movimentação</h2>
            {produtoSelecionado && (
              <span className="card-badge info">Estoque atual: {produtoSelecionado.estoque}</span>
            )}
          </div>
          <form onSubmit={handleSubmit} className="form">
            <div className="form-group">
              <label>Produto</label>
              <div className="input-wrapper">
                <svg className="input-icon" viewBox="0 0 24 24" fill="none">
                  <path d="M20 7L12 3L4 7M20 7L12 11M20 7V17L12 21M12 11L4 7M12 11V21M4 7V17L12 21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <select
                  name="codigoProduto"
                  value={form.codigoProduto}
                  onChange={handleChange}
                  required
                >
                  <option value="">Selecione um produto...</option>
                  {produtos.map((p) => (
                    <option key={p.codigoProduto} value={p.codigoProduto}>
                      #{p.codigoProduto} - {p.descricaoProduto} ({p.estoque} un.)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Quantidade</label>
                <div className="input-wrapper">
                  <svg className="input-icon" viewBox="0 0 24 24" fill="none">
                    <path d="M9 17V7M9 7L5 11M9 7L13 11M15 17V13M15 13L19 9M15 13L11 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <input
                    type="number"
                    name="quantidade"
                    value={form.quantidade}
                    onChange={handleChange}
                    min="1"
                    placeholder="0"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Descrição</label>
                <div className="input-wrapper">
                  <svg className="input-icon" viewBox="0 0 24 24" fill="none">
                    <path d="M11 4H4C3.44772 4 3 4.44772 3 5V20C3 20.5523 3.44772 21 4 21H20C20.5523 21 21 20.5523 21 20V13M18.5 2.5C19.3284 1.67157 20.6716 1.67157 21.5 2.5C22.3284 3.32843 22.3284 4.67157 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <select
                    name="descricao"
                    value={form.descricao}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Selecione o tipo de movimentação...</option>
                    {TIPOS_MOVIMENTACAO.map((t) => (
                      <option key={t.valor} value={t.valor}>{t.valor}</option>
                    ))}
                  </select>
                </div>
                {tipoSelecionado && (
                  <p className="tipo-descricao">{tipoSelecionado.descricao}</p>
                )}
              </div>
            </div>

            <div className="form-group">
              <label>Tipo de Movimentação</label>
              <div className="tipo-group">
                <label className={`tipo-option ${form.tipo === 'ENTRADA' ? 'ativo entrada' : ''}`}>
                  <input
                    type="radio"
                    name="tipo"
                    value="ENTRADA"
                    checked={form.tipo === 'ENTRADA'}
                    onChange={handleChange}
                  />
                  <svg viewBox="0 0 24 24" fill="none">
                    <path d="M12 5V19M12 19L18 13M12 19L6 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Entrada
                </label>
                <label className={`tipo-option ${form.tipo === 'SAIDA' ? 'ativo saida' : ''}`}>
                  <input
                    type="radio"
                    name="tipo"
                    value="SAIDA"
                    checked={form.tipo === 'SAIDA'}
                    onChange={handleChange}
                  />
                  <svg viewBox="0 0 24 24" fill="none">
                    <path d="M12 19V5M12 5L18 11M12 5L6 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Saída
                </label>
              </div>
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? (
                <>
                  <svg className="spinner" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.3" />
                    <path d="M12 2C13.5913 2 15.1174 2.37464 16.4868 3.08977C17.8562 3.8049 19.0261 4.83896 19.919 6.10761" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                  Registrando...
                </>
              ) : (
                <>
                  <svg viewBox="0 0 24 24" fill="none">
                    <path d="M5 13L9 17L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Registrar Movimentação
                </>
              )}
            </button>
          </form>
        </section>
      </div>

      <section className="card glass full-width">
        <div className="card-header">
          <h2>Histórico de Movimentações</h2>
          <span className="card-badge">{movimentacoesFiltradas.length} registros</span>
        </div>

        {movimentacoes.length === 0 ? (
          <div className="empty-state">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M9 17H15M9 13H15M9 9H15M7.5 21H16.5C17.8807 21 19 19.8807 19 18.5V5.5C19 4.11929 17.8807 3 16.5 3H7.5C6.11929 3 5 4.11929 5 5.5V18.5C5 19.8807 6.11929 21 7.5 21Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <p>Nenhuma movimentação registrada ainda.</p>
            <span>Comece lançando a primeira movimentação acima.</span>
          </div>
        ) : (
          <>
            <div className="filtros">
              <div className="busca-wrapper">
                <svg className="input-icon" viewBox="0 0 24 24" fill="none">
                  <path d="M21 21L16.65 16.65M16.65 16.65C17.5548 15.7452 18.0597 14.4986 18.0597 13.18C18.0597 11.8614 17.5548 10.6148 16.65 9.71C15.7452 8.80518 14.4986 8.30031 13.18 8.30031C11.8614 8.30031 10.6148 8.80518 9.71 9.71C8.80518 10.6148 8.30031 11.8614 8.30031 13.18C8.30031 14.4986 8.80518 15.7452 9.71 16.65C10.6148 17.5548 11.8614 18.0597 13.18 18.0597C14.4986 18.0597 15.7452 17.5548 16.65 16.65Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <input
                  type="text"
                  placeholder="Buscar por produto, descrição ou ID..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                />
              </div>
              <div className="filtro-tipo">
                <button
                  className={`filtro-btn ${filtroTipo === 'TODOS' ? 'ativo' : ''}`}
                  onClick={() => setFiltroTipo('TODOS')}
                >
                  Todos
                </button>
                <button
                  className={`filtro-btn entrada ${filtroTipo === 'ENTRADA' ? 'ativo' : ''}`}
                  onClick={() => setFiltroTipo('ENTRADA')}
                >
                  Entradas
                </button>
                <button
                  className={`filtro-btn saida ${filtroTipo === 'SAIDA' ? 'ativo' : ''}`}
                  onClick={() => setFiltroTipo('SAIDA')}
                >
                  Saídas
                </button>
              </div>
            </div>

            <div className="tabela-wrapper">
              <table className="tabela">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Data/Hora</th>
                    <th>Produto</th>
                    <th>Tipo</th>
                    <th>Descrição</th>
                    <th className="text-right">Qtd.</th>
                    <th className="text-right">Est. Ant.</th>
                    <th className="text-right">Est. Final</th>
                  </tr>
                </thead>
                <tbody>
                  {movimentacoesFiltradas.map((m) => (
                    <tr key={m.id} className="fade-in-row">
                      <td className="td-id">#{m.id}</td>
                      <td className="td-data">{formatarData(m.dataHora)}</td>
                      <td className="td-produto">{m.descricaoProduto}</td>
                      <td>
                        <span className={`tag tipo-${m.tipo.toLowerCase()}`}>
                          {m.tipo === 'ENTRADA' ? '↓ Entrada' : '↑ Saída'}
                        </span>
                      </td>
                      <td className="td-descricao">{m.descricao}</td>
                      <td className="text-right">{m.quantidade}</td>
                      <td className="text-right muted">{m.estoqueAnterior}</td>
                      <td className="text-right estoque-final">{m.estoqueFinal}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {movimentacoesFiltradas.length === 0 && (
              <div className="empty-state small">
                <p>Nenhuma movimentação encontrada com os filtros atuais.</p>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  )
}

export default App
