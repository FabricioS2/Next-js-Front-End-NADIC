import api from './api';

export interface User {
  id: number;
  nome: string;
  email: string;
  role: 'user' | 'admin';
}

interface LoginResponse {
  access: string;
  user: User;
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  const response = await api.post<LoginResponse>('/api/token/', { email, password });
  const { access, user } = response.data;
  localStorage.setItem('access_token', access);
  localStorage.setItem('user', JSON.stringify(user));
  return { access, user };
}

export function logout() {
  localStorage.removeItem('access_token');
  localStorage.removeItem('user');
  // Se o backend tiver um endpoint de logout (blacklist), chame aqui:
  // await api.post('/api/logout/');
}

export function getCurrentUser(): User | null {
  if (typeof window === 'undefined') return null;
  const userStr = localStorage.getItem('user');
  if (userStr) {
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }
  return null;
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('access_token');
}

