'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface User {
  id: string;
  name: string | null;
  email: string | null;
  status: string;
  category: string | null;
  createdAt: string;
}

export default function AdminPage() {
  const { data: session, status } = useSession() || {};
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [newStatus, setNewStatus] = useState('approved');
  const [newCategory, setNewCategory] = useState('Pos-graduando');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user?.id) {
      fetchData();
    }
  }, [session]);

  const fetchData = async () => {
    try {
      const userRes = await fetch('/api/auth/me');
      if (userRes.ok) {
        const userData = await userRes.json();
        setCurrentUser(userData);

        if (userData.category !== 'Admin') {
          router.replace('/dashboard');
          return;
        }
      }

      const usersRes = await fetch('/api/admin/users');
      if (usersRes.ok) {
        const data = await usersRes.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = async (userId: string) => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          status: newStatus,
          category: newCategory,
        }),
      });

      if (res.ok) {
        fetchData();
        setSelectedUser(null);
      }
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  if (status === 'loading' || loading) {
    return <div style={{ padding: '2rem' }}>Carregando...</div>;
  }

  if (!currentUser || currentUser.category !== 'Admin') {
    return <div style={{ padding: '2rem' }}>Acesso negado</div>;
  }

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
            <Link href="/admin">Admin</Link>
          </nav>
          <div className="user-menu">
            <span>{currentUser?.name}</span>
            <button onClick={() => router.push('/api/auth/signout')}>Sair</button>
          </div>
        </div>
      </header>

      <main className="container">
        <h2 className="page-title">Painel de Administracao</h2>

        <h3 style={{ marginBottom: '1rem', marginTop: '2rem' }}>Gerenciar Usuarios</h3>
        <table className="table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Email</th>
              <th>Categoria</th>
              <th>Status</th>
              <th>Data de Criacao</th>
              <th>Acoes</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.name || '-'}</td>
                <td>{user.email}</td>
                <td>{user.category || '-'}</td>
                <td><span className={`status-badge status-${user.status}`}>{user.status}</span></td>
                <td>{new Date(user.createdAt).toLocaleDateString('pt-BR')}</td>
                <td>
                  <button
                    onClick={() => setSelectedUser(user.id)}
                    style={{ padding: '0.5rem', background: '#3498db', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                  >
                    Editar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {selectedUser && (
          <div className="modal" onClick={() => setSelectedUser(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h3>Atualizar Usuario</h3>
              <div className="form-group">
                <label>Status</label>
                <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
                  <option value="pending">Pendente</option>
                  <option value="approved">Aprovado</option>
                </select>
              </div>

              <div className="form-group">
                <label>Categoria</label>
                <select value={newCategory} onChange={(e) => setNewCategory(e.target.value)}>
                  <option value="IC">IC</option>
                  <option value="Pos-graduando">Pos-graduando</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  onClick={() => handleUpdateUser(selectedUser)}
                  className="button button-primary"
                >
                  Salvar
                </button>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="button"
                  style={{ background: '#999', color: 'white', border: 'none' }}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
