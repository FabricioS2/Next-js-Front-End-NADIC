# 🪸 Simpósio Coral Vivo – Plataforma de Inscrições e Submissão de Artigos

Sistema full-stack para gerenciamento de um evento científico sobre branqueamento de corais. Permite que participantes se inscrevam, submetam artigos (com upload de arquivo) e que administradores visualizem todos os dados e limpem o sistema.

- **Frontend**: Next.js (App Router) com autenticação JWT e componentes client-side.
- **Backend**: Django REST Framework com autenticação JWT, modelo de usuário customizado, permissões por papel (user/admin) e upload de arquivos.

---

## 🧱 Tecnologias Utilizadas

| Frontend               | Backend                 |
|------------------------|-------------------------|
| Next.js 14 (App Router) | Django 4.2+             |
| TypeScript (JSX)       | Django REST Framework   |
| Axios                  | Simple JWT              |
| React Hooks            | SQLite (padrão) / PostgreSQL |
| Three.js (fundo 3D)    | django-cors-headers     |
| CSS Modules / global   | File upload             |

---

## 📁 Estrutura do Projeto

### Frontend (Next.js)

```
coral-simposio-front/
├── app/
│   ├── (protected)/            # Rotas que exigem autenticação
│   │   ├── admin/page.tsx      # Painel administrativo
│   │   ├── dashboard/page.tsx  # Painel do usuário comum
│   │   └── layout.tsx          # Layout com AuthGuard para todas as rotas protegidas
│   ├── (public)/               # Rotas públicas
│   │   ├── layout.tsx          # Layout sem guard (página inicial, login)
│   │   ├── login/page.tsx      # Página de login
│   │   └── page.tsx            # Página inicial com formulário de inscrição
│   ├── error.tsx               # Página de erro global
│   ├── globals.css             # Estilos globais e animações
│   ├── layout.tsx              # Root layout (Header + ToastProvider)
│   └── loading.tsx             # Loading global
├── components/                 # Componentes reutilizáveis
│   ├── AuthGuard.tsx           # Protege rotas baseado no papel do usuário
│   ├── Header.tsx              # Navegação condicional
│   ├── InscricaoForm.tsx       # Formulário de inscrição (página inicial)
│   ├── ThreeCanvas.tsx         # Fundo 3D com Three.js
│   └── ToastProvider.tsx       # Sistema de notificações toast
├── lib/
│   ├── api.ts                  # Cliente Axios com interceptors e integração com o backend
│   └── auth.ts                 # Funções de login, logout, getCurrentUser
└── public/                     # (opcional) arquivos estáticos
```

### Backend (Django)

```
backend/
├── manage.py
├── backend/                    # Configurações do projeto
│   ├── settings.py
│   ├── urls.py
│   └── ...
├── api/                        # Aplicação principal
│   ├── models.py               # User (custom) e Artigo
│   ├── serializers.py          # UserSerializer, UserCreateSerializer, ArtigoSerializer
│   ├── views.py                # Login, inscrição, artigos, admin views
│   ├── permissions.py          # IsAdminUserCustom
│   ├── urls.py                 # Rotas da API
│   └── admin.py                # Registro dos modelos no admin do Django
├── media/                      # Arquivos enviados pelos usuários (artigos)
└── requirements.txt
```

---

## 📄 Descrição Detalhada dos Arquivos

### 🔹 Frontend

#### `lib/api.ts`
Configuração do Axios.  
- Define `baseURL` (padrão `http://localhost:8000`).  
- Adiciona token JWT no header `Authorization` (se presente no `localStorage`).  
- Interceptor de resposta: se receber 401 (não autorizado), limpa token e redireciona para `/login`.

#### `lib/auth.ts`
Gerencia autenticação no `localStorage`.  
- `login(email, password)`: chama `/api/token/` e armazena token + usuário.  
- `logout()`: remove dados.  
- `getCurrentUser()`: recupera usuário do storage.  
- `getToken()`: recupera token.

#### `components/AuthGuard.tsx`
Componente de proteção de rotas.  
- Verifica se existe usuário logado; caso contrário, redireciona para `/login`.  
- Se `requiredRole` for fornecido (`'user'` ou `'admin'`), redireciona se o papel não corresponder.  
- Exibe um loading enquanto verifica.

#### `components/Header.tsx`
Barra de navegação superior.  
- Exibe links diferentes conforme o usuário esteja logado e seu papel.  
- Mostra "Meu Painel" apenas para usuários comuns; "Admin" apenas para admins.  
- Botão de logout.

#### `components/ToastProvider.tsx`
Contexto para exibir notificações do tipo toast (sucesso, erro, info, warning).  
- `showToast(message, type)` adiciona um toast que some após 3 segundos.  
- Utilizado em todo o sistema para feedback ao usuário.

#### `components/ThreeCanvas.tsx`
Fundo 3D animado com Three.js.  
- Cria uma cena subaquática com chão ondulado, corais e partículas ascendentes.  
- Câmera se move lentamente.  
- Implementado com carregamento dinâmico (`import('three')`) e `useEffect` para limpeza.

#### `components/InscricaoForm.tsx`
Formulário de inscrição de novos participantes.  
- Envia dados para `/api/inscricoes/`.  
- Após sucesso, redireciona para `/login`.  
- Todos os campos obrigatórios são validados.

#### `app/(public)/page.tsx` (página inicial)
Exibe o `InscricaoForm` e uma breve descrição do evento.

#### `app/(public)/login/page.tsx`
Formulário de login que chama `login()` e redireciona para `/dashboard` (usuário comum) ou `/admin` (admin).

#### `app/(protected)/dashboard/page.tsx`
Painel do usuário comum.  
- Mostra “Bem-vindo, nome”.  
- Aba “Meus Artigos”: lista artigos submetidos pelo usuário.  
- Aba “Submeter Artigo”: formulário com título, resumo, palavras‑chave, área e upload de arquivo (PDF/DOCX).  
- Utiliza `AuthGuard` com `requiredRole="user"`.

#### `app/(protected)/admin/page.tsx`
Painel administrativo.  
- Exibe estatísticas (total de inscritos, total de artigos).  
- Lista todos os inscritos (nome, email, instituição, categoria).  
- Lista todos os artigos submetidos (título, autor, área, data).  
- Clique no artigo mostra resumo e palavras‑chave via `alert`.  
- Botão “Apagar todos os dados” chama endpoint `/api/admin/limpar-dados/`.  
- Protegido com `requiredRole="admin"`.

#### `app/(protected)/layout.tsx`
Envolve todas as rotas protegidas com `AuthGuard` (sem papel específico – o papel é verificado dentro de cada página).

#### `app/layout.tsx`
Root layout:  
- Define metadados (título, descrição).  
- Inclui `ToastProvider` e `Header`.  
- Carrega a fonte Inter.

#### `app/error.tsx` e `app/loading.tsx`
Páginas globais de erro e loading com estilo consistente (glassmorphism).

#### `app/globals.css`
Estilos globais:  
- Tema escuro com efeito glassmorphism.  
- Animações suaves.  
- Estilos para tabelas, botões, formulários, toasts.  
- Background com gradiente e fallback para o canvas 3D.

---

### 🔹 Backend (Django REST)

#### `api/models.py`
Define dois modelos:

- **User** (customizado):  
  - Herda de `AbstractUser`, usando `email` como campo de login (`USERNAME_FIELD`).  
  - Campos: `nome`, `instituicao`, `categoria`, `pais`, `telefone`, `role` ('user' ou 'admin'), `dataCriacao`.  
  - `UserManager` sobrescrito para criar usuários com email e senha.

- **Artigo**:  
  - Relacionado com `User` (autor).  
  - Campos: `titulo`, `resumo`, `palavrasChave`, `area`, `arquivo` (upload para `media/artigos/`), `dataSubmissao`.

#### `api/serializers.py`
- `UserSerializer`: retorna dados do usuário (sem senha).  
- `UserCreateSerializer`: usado na inscrição, com campo `senha` write‑only.  
- `ArtigoSerializer`: inclui campo virtual `autorNome` para facilitar a exibição.

#### `api/permissions.py`
- `IsAdminUserCustom`: verifica se `user.role == 'admin'`.

#### `api/views.py`
Endpoints implementados:

| Classe | Método | Rota | Descrição |
|--------|--------|------|------------|
| `LoginView` | POST | `/api/token/` | Autentica e retorna JWT + dados do usuário. |
| `InscricaoCreateView` | POST | `/api/inscricoes/` | Cria novo usuário (role='user'). |
| `ArtigoListCreateView` | GET, POST | `/api/artigos/` | Lista artigos do próprio usuário; cria artigo associado ao autor. |
| `AdminInscricoesListView` | GET | `/api/admin/inscricoes/` | (Admin) Lista todos os usuários com role='user'. |
| `AdminArtigosListView` | GET | `/api/admin/artigos/` | (Admin) Lista todos os artigos. |
| `AdminClearDataView` | DELETE | `/api/admin/limpar-dados/` | (Admin) Remove todos os artigos e usuários comuns. |

Todas as views administrativas usam `permission_classes = [IsAuthenticated, IsAdminUserCustom]`.

#### `api/urls.py`
Mapeia as rotas acima com prefixo `/api/`.

#### `backend/settings.py`
- `INSTALLED_APPS`: inclui `rest_framework`, `corsheaders`, `api`.  
- `AUTH_USER_MODEL = 'api.User'`.  
- `REST_FRAMEWORK`: autenticação JWT padrão.  
- `CORS_ALLOWED_ORIGINS = ['http://localhost:3000']`.  
- Configuração de mídia (`MEDIA_ROOT`, `MEDIA_URL`).

---

## 🚀 Como Executar o Projeto

### Pré‑requisitos
- Node.js 18+ e npm/yarn/pnpm
- Python 3.10+ e pip

### 1. Backend (Django)

```bash
# Clone ou navegue até a pasta backend
cd backend

# Crie e ative um ambiente virtual
python -m venv venv
source venv/bin/activate   # Linux/Mac
venv\Scripts\activate      # Windows

# Instale as dependências
pip install -r requirements.txt

# Execute as migrações
python manage.py makemigrations api
python manage.py migrate

# Crie um superusuário (admin)
python manage.py createsuperuser
# Forneça email, nome e senha

# Inicie o servidor
python manage.py runserver
```

O backend estará em `http://localhost:8000`.

### 2. Frontend (Next.js)

```bash
# Em outro terminal, na pasta coral-simposio-front
npm install
# ou
yarn install

# Configure a variável de ambiente (opcional)
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local

# Inicie o servidor de desenvolvimento
npm run dev
```

O frontend estará em `http://localhost:3000`.

---

## 📡 Endpoints da API

| Método | Endpoint                          | Autenticação | Papel    | Descrição |
|--------|-----------------------------------|--------------|----------|------------|
| POST   | `/api/token/`                     | Não          | -        | Login (email, password) → {access, user} |
| POST   | `/api/inscricoes/`                | Não          | -        | Criar novo usuário (inscrição) |
| GET    | `/api/artigos/`                   | Sim          | user/admin | Lista artigos do próprio usuário |
| POST   | `/api/artigos/`                   | Sim          | user/admin | Submeter novo artigo (multipart/form-data) |
| GET    | `/api/admin/inscricoes/`          | Sim          | admin    | Lista todos os usuários comuns |
| GET    | `/api/admin/artigos/`             | Sim          | admin    | Lista todos os artigos |
| DELETE | `/api/admin/limpar-dados/`        | Sim          | admin    | Remove todos os artigos e usuários comuns |

---

## 🔐 Fluxo de Autenticação e Autorização

1. **Inscrição** → usuário cria conta (`role='user'` por padrão).  
2. **Login** → envia credenciais para `/api/token/`, recebe JWT e dados do usuário.  
3. **Armazenamento** → token e usuário salvos no `localStorage`.  
4. **Requisições autenticadas** → `api.ts` adiciona `Authorization: Bearer <token>`.  
5. **Proteção de rotas** → `AuthGuard` lê o papel do usuário e redireciona se necessário.  
6. **Administrador** → criado via `createsuperuser` (role='admin'). Pode acessar `/admin` e endpoints administrativos.
