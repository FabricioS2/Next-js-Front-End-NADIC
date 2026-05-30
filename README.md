Aqui está o `README.md` unificado para o projeto completo do Simpósio Coral Vivo, contendo tanto o frontend Next.js quanto o backend Django REST Framework.

```markdown
# Simpósio Coral Vivo – Plataforma completa (Frontend + Backend)

Plataforma para submissão de artigos e gestão de participantes do simpósio, desenvolvida com **Next.js 14** (frontend) e **Django REST Framework** (backend).

---

## 📦 Visão geral do projeto

| Camada       | Tecnologia                     | Porta padrão |
|--------------|--------------------------------|--------------|
| Frontend     | Next.js 14 (App Router)        | 3000         |
| Backend      | Django + DRF + JWT             | 8000         |
| Banco de dados | SQLite (pode ser PostgreSQL) | -            |

O frontend consome a API REST do backend, permitindo:
- Inscrição de novos participantes (público)
- Login com JWT
- Submissão de artigos (PDF)
- Dashboard pessoal do usuário
- Painel administrativo completo

---

## 🚀 Como executar o projeto completo (frontend + backend)

### Pré‑requisitos
- Node.js 18+ ou 20+
- Python 3.9+
- npm ou yarn
- (Opcional) Git

---

### 1. Backend (Django)

```bash
# Acesse a pasta do backend
cd backend

# Crie um ambiente virtual
python -m venv venv
source venv/bin/activate      # Linux/Mac
# ou
venv\Scripts\activate          # Windows

# Instale as dependências
pip install -r requirements.txt

# Execute as migrações e crie o banco de dados
python manage.py makemigrations api
python manage.py migrate

# Crie um superusuário (admin)
python manage.py createsuperuser

# Inicie o servidor
python manage.py runserver
```

O backend estará disponível em `http://localhost:8000`.

### 2. Frontend (Next.js)

Abra um **novo terminal** e execute:

```bash
# Acesse a pasta do frontend (raiz do projeto frontend)
cd frontend

# Instale as dependências
npm install
# ou
yarn install

# Configure o ambiente (opcional)
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local

# Inicie o servidor de desenvolvimento
npm run dev
# ou
yarn dev
```

O frontend estará disponível em `http://localhost:3000`.

Agora você pode acessar a aplicação completa.

---

## 🗂️ Estrutura do projeto combinada

```
projeto-simposio/
├── backend/                     # Django REST API
│   ├── manage.py
│   ├── requirements.txt
│   ├── backend/
│   │   ├── settings.py
│   │   ├── urls.py
│   │   └── ...
│   └── api/
│       ├── models.py            # User (email/login) + Artigo
│       ├── views.py             # Login, inscrição, artigos, admin
│       ├── serializers.py
│       ├── permissions.py
│       ├── urls.py
│       └── admin.py
├── frontend/                    # Next.js aplicação
│   ├── app/
│   │   ├── (public)/            # Rotas públicas (/, /login)
│   │   ├── (protected)/         # Rotas protegidas (dashboard, admin)
│   │   ├── layout.tsx
│   │   ├── globals.css
│   │   └── ...
│   ├── components/
│   │   ├── AuthGuard.tsx
│   │   ├── Header.tsx
│   │   ├── InscricaoForm.tsx
│   │   ├── ThreeCanvas.tsx      # Fundo 3D
│   │   └── ToastProvider.tsx
│   ├── lib/
│   │   ├── api.ts               # Cliente Axios (modo mock ou real)
│   │   └── auth.ts              # Login, logout, token
│   └── package.json
└── README.md                    # Este arquivo
```

---

## 🔗 Endpoints da API (backend)

| Método | Endpoint                          | Descrição                          | Acesso        |
|--------|-----------------------------------|------------------------------------|---------------|
| POST   | `/api/token/`                     | Login → tokens JWT + dados do user | público       |
| POST   | `/api/inscricoes/`                | Cadastro de novo usuário           | público       |
| GET    | `/api/artigos/`                   | Lista artigos do usuário logado    | autenticado   |
| POST   | `/api/artigos/`                   | Submeter novo artigo (PDF)         | autenticado   |
| GET    | `/api/admin/inscricoes/`          | Lista todos os participantes       | admin         |
| GET    | `/api/admin/artigos/`             | Lista todos os artigos submetidos  | admin         |
| DELETE | `/api/admin/limpar-dados/`        | Remove usuários comuns e artigos   | admin         |

Os detalhes de cada endpoint (campos, exemplos) estão na documentação do backend (arquivo `backend/README.md` interno).

---

## 🌐 Rotas do frontend

| Rota           | Público? | Descrição                                           |
|----------------|----------|-----------------------------------------------------|
| `/`            | ✅ Sim   | Landing page + formulário de inscrição              |
| `/login`       | ✅ Sim   | Página de login                                     |
| `/dashboard`   | ❌ Não   | Painel do usuário comum (submeter/ver artigos)      |
| `/admin`       | ❌ Não   | Painel administrativo (gestão de inscrições/artigos)|

---

## 🔧 Modo MOCK (frontend sem backend)

Caso queira testar apenas o layout do frontend sem executar o backend Django, o frontend possui um **modo mock** interno.

- No arquivo `frontend/lib/api.ts`, altere `USE_MOCK = true`.
- O frontend passará a simular todas as respostas da API.
- O login é simulado: qualquer email que contenha `"admin"` será tratado como administrador.
- **Nenhum dado é persistido** – útil para demonstração ou desenvolvimento offline.

Para voltar a usar o backend real, mude `USE_MOCK = false`.

---

## 🧪 Fluxo completo de uso (com backend real)

1. **Visitante** acessa `http://localhost:3000/`
2. Preenche o formulário de inscrição e cria uma conta
3. Após criar a conta, faz login em `/login`
4. **Usuário comum** é redirecionado para `/dashboard`:
   - Pode submeter um artigo (arquivo PDF)
   - Visualiza seus artigos já submetidos
5. **Administrador** (criado via `createsuperuser` no Django):
   - Faz login e é redirecionado para `/admin`
   - Visualiza todos os participantes e todos os artigos
   - Pode usar o botão “Limpar dados de teste” para remover todos os usuários comuns e artigos

---

## 📦 Dependências principais

### Backend (Django)
```
Django
djangorestframework
djangorestframework-simplejwt
django-cors-headers
```

### Frontend (Next.js)
```
next
react
react-dom
axios
three
```

Ambos os projetos já possuem seus respectivos arquivos de dependências (`requirements.txt` e `package.json`).

---

## ⚙️ Configuração avançada

### Backend – trocar SQLite por PostgreSQL
Edite `backend/backend/settings.py`:
```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'simposio',
        'USER': 'postgres',
        'PASSWORD': 'senha',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}
```
Não esqueça de instalar `psycopg2-binary` e rodar as migrações novamente.

### Frontend – alterar URL da API
Crie um arquivo `.env.local` no diretório `frontend/`:
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```
Ou, em produção, aponte para a URL do backend hospedado.

### Segurança – token JWT
O token de acesso expira após **1 hora**. Para implementar refresh token, utilize o endpoint `/api/token/refresh/` (já disponível no backend) e armazene o refresh token no frontend.

---

## 🐛 Problemas comuns e soluções

| Problema                                   | Solução                                                                 |
|--------------------------------------------|-------------------------------------------------------------------------|
| Frontend não enxerga o backend             | Verifique se o backend está rodando em `http://localhost:8000` e se `USE_MOCK = false` |
| CORS error no navegador                    | Certifique-se de que o backend tem `django-cors-headers` instalado e configurado em `settings.py` |
| Erro de autenticação 401 (token inválido)  | Faça logout e login novamente; verifique se o token não expirou          |
| Arquivo PDF não é salvo                    | Confirme que a pasta `backend/media/` tem permissão de escrita           |
| Three.js não carrega (WebGL error)         | O componente `ThreeCanvas.tsx` já trata fallback – pode ser desabilitado removendo-o do `layout.tsx` |

---

## 📄 Licença

Projeto desenvolvido para fins acadêmicos e educacionais no contexto do **Simpósio Coral Vivo**.

---

## 👥 Contribuição

Para contribuir com melhorias, faça um fork do repositório e envie um Pull Request. Para reportar bugs, use a seção de Issues.

---

**Desenvolvido com Next.js, Django REST Framework e Three.js – que os corais floresçam! 🪸**
```