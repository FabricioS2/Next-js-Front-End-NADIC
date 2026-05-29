// import axios from 'axios';

// const api = axios.create({
//   baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
//   headers: { 'Content-Type': 'application/json' },
// });

// // Adiciona token JWT a todas as requisições
// api.interceptors.request.use((config) => {
//   const token = localStorage.getItem('access_token');
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });

// // Redireciona para login se receber 401
// api.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response?.status === 401) {
//       localStorage.removeItem('access_token');
//       localStorage.removeItem('user');
//       if (typeof window !== 'undefined') {
//         window.location.href = '/login';
//       }
//     }
//     return Promise.reject(error);
//   }
// );

// export default api;


// lib/api.ts
import axios from 'axios';

const USE_MOCK = true; // ← liga o modo de teste sem backend
const MOCK_DELAY = 300; // ms

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  headers: { 'Content-Type': 'application/json' },
});

// Interceptor de request (mantém token se existir)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Interceptor de response - se estiver em mock, desvia para dados falsos
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Se não houver backend e estivermos em mock, não faz redirect 401
    if (USE_MOCK) return Promise.reject(error);
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      if (typeof window !== 'undefined') window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Wrapper que retorna mock quando USE_MOCK = true
const originalPost = api.post;
const originalGet = api.get;
const originalDelete = api.delete;

if (USE_MOCK) {
  api.post = async function(url: string, data?: any, config?: any) {
    await new Promise(r => setTimeout(r, MOCK_DELAY));
    // Simula criação de inscrição
    if (url === '/api/inscricoes/') {
      return { data: { id: Math.floor(Math.random()*1000), ...data } };
    }
    // Simula login (qualquer email/senha, mas vamos tratar no auth.ts separadamente)
    if (url === '/api/token/') {
      const { email, password } = data;
      const isAdmin = email.includes('admin');
      return {
        data: {
          access: 'mock-jwt-token',
          user: {
            id: 1,
            nome: email.split('@')[0] || 'Teste',
            email: email,
            role: isAdmin ? 'admin' : 'user',
          }
        }
      };
    }
    return originalPost.call(this, url, data, config);
  };

  api.get = async function(url: string, config?: any) {
    await new Promise(r => setTimeout(r, MOCK_DELAY));
    // Lista de inscrições para admin
    if (url === '/api/admin/inscricoes/') {
      return {
        data: [
          { id: 1, nome: 'João Silva', email: 'joao@email.com', instituicao: 'UFRJ', categoria: 'pesquisador', dataCriacao: new Date().toISOString() },
          { id: 2, nome: 'Maria Santos', email: 'maria@email.com', instituicao: 'USP', categoria: 'estudante', dataCriacao: new Date().toISOString() },
        ]
      };
    }
    // Lista de artigos para admin
    if (url === '/api/admin/artigos/') {
      return {
        data: [
          { id: 1, titulo: 'Impacto do aquecimento global', autorNome: 'João Silva', area: 'biologia', dataSubmissao: new Date().toISOString(), resumo: 'Resumo do artigo...', palavrasChave: 'coral, clima' },
          { id: 2, titulo: 'Recuperação de recifes', autorNome: 'Maria Santos', area: 'conservacao', dataSubmissao: new Date().toISOString(), resumo: 'Outro resumo...', palavrasChave: 'recuperação' },
        ]
      };
    }
    // Artigos do usuário logado
    if (url === '/api/artigos/') {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      return {
        data: [
          { id: 10, titulo: 'Meu artigo mock', area: 'ecologia', dataSubmissao: new Date().toISOString(), resumo: 'Resumo do meu artigo', palavrasChave: 'teste' }
        ]
      };
    }
    return originalGet.call(this, url, config);
  };

  api.delete = async function(url: string, config?: any) {
    await new Promise(r => setTimeout(r, MOCK_DELAY));
    if (url === '/api/admin/limpar-dados/') {
      console.log('[MOCK] Dados limpos');
      return { data: { status: 'ok' } };
    }
    return originalDelete.call(this, url, config);
  };
}

export default api;