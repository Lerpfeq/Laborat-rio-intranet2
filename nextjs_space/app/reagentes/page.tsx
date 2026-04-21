'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import EtiquetaReagente from '@/components/EtiquetaReagente';

interface Reagente {
  id: string;
  nome: string;
  marca: string | null;
  volume: string | null;
  localidade: string | null;
  status: string;
}

export default function ReagentesPage() {
  const { data: session, status } = useSession() || {};
  const router = useRouter();
  const [reagentes, setReagentes] = useState<Reagente[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('consulta');
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user?.id) {
      fetchUserAndReagentes();
    }
  }, [session]);

  const fetchUserAndReagentes = async () => {
    try {
      const userRes = await fetch('/api/auth/me');
      if (userRes.ok) {
        const userData = await userRes.json();
        setUser(userData);
      }

      const reagentesRes = await fetch('/api/reagentes');
      if (reagentesRes.ok) {
        const data = await reagentesRes.json();
        setReagentes(data);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return <div style={{ padding: '2rem' }}>Carregando...</div>;
  }

  const isAdmin = user?.category === 'Admin';
  const isPosGraduando = user?.category === 'Pos-graduando';

  return (
    <div>
      <header className="header">
        <div className="header-container">
          <div className="logo-section">
            <div style={{ position: 'relative', width: '40px', height: '40px' }}>
              <Image src="/logo.png" alt="LERP Logo" fill style={{ objectFit: 'contain' }} />
            </div>
            <div className="logo-text"><h1>LERP</h1></div>
          </div>
          <nav className="nav-tabs">
            <Link href="/dashboard">Dashboard</Link>
            <Link href="/reagentes">Reagentes</Link>
          </nav>
          <div className="user-menu">
            <span>{user?.name}</span>
            <button onClick={() => router.push('/api/auth/signout')}>Sair</button>
          </div>
        </div>
      </header>

      <main className="container">
        <h2 className="page-title">Gestão de Reagentes</h2>

        {(isPosGraduando || isAdmin) && (
          <div style={{ marginBottom: '2rem', display: 'flex', gap: '1rem', borderBottom: '2px solid #e0e0e0' }}>
            <button
              onClick={() => setTab('consulta')}
              style={{ padding: '0.75rem 1rem', background: tab === 'consulta' ? '#3498db' : 'transparent', color: tab === 'consulta' ? 'white' : '#333', border: 'none', cursor: 'pointer', borderRadius: '4px 4px 0 0' }}
            >
              Consulta de Estoque
            </button>
            <button
              onClick={() => setTab('entrada')}
              style={{ padding: '0.75rem 1rem', background: tab === 'entrada' ? '#3498db' : 'transparent', color: tab === 'entrada' ? 'white' : '#333', border: 'none', cursor: 'pointer', borderRadius: '4px 4px 0 0' }}
            >
              Entrada de Reagente
            </button>
            <button
              onClick={() => setTab('saida')}
              style={{ padding: '0.75rem 1rem', background: tab === 'saida' ? '#3498db' : 'transparent', color: tab === 'saida' ? 'white' : '#333', border: 'none', cursor: 'pointer', borderRadius: '4px 4px 0 0' }}
            >
              Saída de Reagente
            </button>
          </div>
        )}

        {tab === 'consulta' && <ConsultaReagentes />}
        {tab === 'entrada' && (isPosGraduando || isAdmin) && <EntradaForm onSuccess={fetchUserAndReagentes} />}
        {tab === 'saida' && (isPosGraduando || isAdmin) && <SaidaForm reagentes={reagentes} onSuccess={fetchUserAndReagentes} />}
      </main>
    </div>
  );
}

function ConsultaReagentes() {
  const [reagentes, setReagentes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [filtros, setFiltros] = useState({ nome: '', marca: '' });

  useEffect(() => {
    fetchReagentes();
  }, []);

  const fetchReagentes = async (nome = '', marca = '') => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (nome) params.append('nome', nome);
      if (marca) params.append('marca', marca);

      const res = await fetch(`/api/reagentes/consulta?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setReagentes(data);
      }
    } catch (error) {
      console.error('Erro ao buscar:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field: string, value: string) => {
    const novosFiltros = { ...filtros, [field]: value };
    setFiltros(novosFiltros);
    fetchReagentes(novosFiltros.nome, novosFiltros.marca);
  };

  return (
    <div>
      <h3 style={{ marginBottom: '1.5rem' }}>🔍 Consulta de Estoque</h3>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '1rem',
          marginBottom: '1.5rem',
          padding: '1rem',
          backgroundColor: '#ecf0f1',
          borderRadius: '4px',
        }}
      >
        <div className="form-group" style={{ margin: 0 }}>
          <label>Filtrar por Nome</label>
          <input
            type="text"
            value={filtros.nome}
            onChange={(e) => handleFilterChange('nome', e.target.value)}
            placeholder="Digite o nome do reagente"
          />
        </div>
        <div className="form-group" style={{ margin: 0 }}>
          <label>Filtrar por Marca</label>
          <input
            type="text"
            value={filtros.marca}
            onChange={(e) => handleFilterChange('marca', e.target.value)}
            placeholder="Digite a marca"
          />
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem' }}>Carregando...</div>
      ) : reagentes.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#7f8c8d' }}>Nenhum reagente encontrado</div>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Marca</th>
              <th>Código Interno</th>
              <th>Categoria</th>
              <th>Concentração</th>
              <th>Localização</th>
              <th>Validade</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {reagentes.map((r) => {
              const ultimaEntrada = r.entradas[0];
              return (
                <tr key={r.id}>
                  <td><strong>{r.nome}</strong></td>
                  <td>{r.marca || '-'}</td>
                  <td><code>{ultimaEntrada?.codigoInterno || '-'}</code></td>
                  <td>{ultimaEntrada?.categoria || '-'}</td>
                  <td>{ultimaEntrada?.concentracao || '-'}</td>
                  <td>{ultimaEntrada?.localizacao || '-'}</td>
                  <td>
                    {ultimaEntrada?.dataValidade
                      ? new Date(ultimaEntrada.dataValidade).toLocaleDateString('pt-BR')
                      : '-'}
                  </td>
                  <td><span className={`status-badge status-${r.status}`}>{r.status}</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}

function EntradaForm({ onSuccess }: { onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [etiqueta, setEtiqueta] = useState<any>(null);
  const [formData, setFormData] = useState({
    nome: '',
    marca: '',
    volume: '',
    localidade: '',
    fornecedor: '',
    notaFiscal: '',
    quantidade: 1,
    dataEntrada: new Date().toISOString().split('T')[0],
    categoria: '',
    concentracao: '',
    dataValidade: '',
    perigos: '',
    responsavel: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setEtiqueta(null);

    try {
      const res = await fetch('/api/reagentes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        const data = await res.json();
        setEtiqueta(data);
        setMessage('Reagente adicionado com sucesso!');
        setTimeout(() => {
          setFormData({
            nome: '',
            marca: '',
            volume: '',
            localidade: '',
            fornecedor: '',
            notaFiscal: '',
            quantidade: 1,
            dataEntrada: new Date().toISOString().split('T')[0],
            categoria: '',
            concentracao: '',
            dataValidade: '',
            perigos: '',
            responsavel: '',
          });
        }, 3000);
        onSuccess();
      } else {
        setMessage('Erro ao adicionar reagente');
      }
    } catch (error) {
      setMessage('Erro ao adicionar reagente');
    } finally {
      setLoading(false);
    }
  };

  if (etiqueta) {
    return (
      <div>
        <h3 style={{ marginBottom: '1rem', color: '#27ae60' }}>✅ Etiqueta Gerada</h3>
        <EtiquetaReagente entrada={etiqueta} logoUrl="/logo.png" />
        <button
          onClick={() => setEtiqueta(null)}
          style={{
            marginTop: '2rem',
            padding: '0.75rem 1.5rem',
            background: '#3498db',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Registrar Outro Reagente
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: '700px', margin: '0 auto' }}>
      <div className="form-group">
        <label>Nome do Reagente *</label>
        <input
          type="text"
          value={formData.nome}
          onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
          required
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div className="form-group">
          <label>Marca</label>
          <input
            type="text"
            value={formData.marca}
            onChange={(e) => setFormData({ ...formData, marca: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label>Categoria (ex: Orgânico)</label>
          <input
            type="text"
            value={formData.categoria}
            onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div className="form-group">
          <label>Volume</label>
          <input
            type="text"
            value={formData.volume}
            onChange={(e) => setFormData({ ...formData, volume: e.target.value })}
            placeholder="Ex: 1L, 500ml"
          />
        </div>
        <div className="form-group">
          <label>Concentração (ex: 99,5%)</label>
          <input
            type="text"
            value={formData.concentracao}
            onChange={(e) => setFormData({ ...formData, concentracao: e.target.value })}
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div className="form-group">
          <label>Localização (ex: ARM-03 | PRAT-02)</label>
          <input
            type="text"
            value={formData.localidade}
            onChange={(e) => setFormData({ ...formData, localidade: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label>Data de Validade</label>
          <input
            type="date"
            value={formData.dataValidade}
            onChange={(e) => setFormData({ ...formData, dataValidade: e.target.value })}
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div className="form-group">
          <label>Fornecedor *</label>
          <input
            type="text"
            value={formData.fornecedor}
            onChange={(e) => setFormData({ ...formData, fornecedor: e.target.value })}
            required
          />
        </div>
        <div className="form-group">
          <label>Nota Fiscal</label>
          <input
            type="text"
            value={formData.notaFiscal}
            onChange={(e) => setFormData({ ...formData, notaFiscal: e.target.value })}
          />
        </div>
      </div>

      <div className="form-group">
        <label>Avisos/Perigos (ex: ⚠️ Inflamável)</label>
        <input
          type="text"
          value={formData.perigos}
          onChange={(e) => setFormData({ ...formData, perigos: e.target.value })}
          placeholder="Ex: Inflamável, Tóxico"
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div className="form-group">
          <label>Quantidade *</label>
          <input
            type="number"
            value={formData.quantidade}
            onChange={(e) => setFormData({ ...formData, quantidade: parseInt(e.target.value) })}
            min="1"
            required
          />
        </div>
        <div className="form-group">
          <label>Responsável</label>
          <input
            type="text"
            value={formData.responsavel}
            onChange={(e) => setFormData({ ...formData, responsavel: e.target.value })}
          />
        </div>
      </div>

      <div className="form-group">
        <label>Data de Entrada</label>
        <input
          type="date"
          value={formData.dataEntrada}
          onChange={(e) => setFormData({ ...formData, dataEntrada: e.target.value })}
        />
      </div>

      <button type="submit" disabled={loading} className="button button-primary">
        {loading ? 'Processando...' : '🏷️ Gerar Etiqueta e Registrar'}
      </button>

      {message && <div className={message.includes('sucesso') ? 'success-message' : 'error-message'}>{message}</div>}
    </form>
  );
}

function SaidaForm({ reagentes, onSuccess }: { reagentes: Reagente[]; onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({
    reagenteId: '',
    quantidade: 1,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const res = await fetch('/api/reagentes/saida', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setMessage('Saída registrada com sucesso!');
        setFormData({ reagenteId: '', quantidade: 1 });
        onSuccess();
      } else {
        setMessage('Erro ao registrar saída');
      }
    } catch (error) {
      setMessage('Erro ao registrar saída');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: '600px', margin: '0 auto' }}>
      <div className="form-group">
        <label>Reagente *</label>
        <select
          value={formData.reagenteId}
          onChange={(e) => setFormData({ ...formData, reagenteId: e.target.value })}
          required
        >
          <option value="">Selecione um reagente</option>
          {reagentes.map((r) => (
            <option key={r.id} value={r.id}>
              {r.nome}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label>Quantidade *</label>
        <input
          type="number"
          value={formData.quantidade}
          onChange={(e) => setFormData({ ...formData, quantidade: parseInt(e.target.value) })}
          min="1"
          required
        />
      </div>

      <button type="submit" disabled={loading} className="button button-primary">
        {loading ? 'Registrando...' : 'Registrar Saída'}
      </button>

      {message && <div className={message.includes('sucesso') ? 'success-message' : 'error-message'}>{message}</div>}
    </form>
  );
}