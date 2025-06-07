# Minimal Todo

Um aplicativo de lista de tarefas minimalista inspirado no tweek.so, desenvolvido com React, TypeScript, Node.js e MongoDB.

## 🚀 Funcionalidades

- Interface minimalista e intuitiva
- Visualização semanal de tarefas
- Limite de 15 tarefas por dia
- Autenticação de usuários
- Proteção de rotas
- Validação de senha forte
- Design responsivo

## 🛠️ Tecnologias

### Frontend
- React
- TypeScript
- Vite
- CSS Modules

### Backend
- Node.js
- Express
- MongoDB
- JWT para autenticação
- Bcrypt para hash de senhas

## 📋 Pré-requisitos

- Node.js (versão 18 ou superior)
- MongoDB
- NPM ou Yarn

## 🔧 Instalação

1. Clone o repositório:
```bash
git clone https://github.com/juleklazura/Minimaltodo.git
cd minimal-todo
```

2. Instale as dependências do frontend:
```bash
npm install
```

3. Instale as dependências do backend:
```bash
cd api
npm install
```

4. Configure as variáveis de ambiente:

Crie um arquivo `.env` na raiz do projeto:
```env
VITE_API_URL=http://localhost:4000
```

Crie um arquivo `.env` na pasta `api`:
```env
PORT=4000
MONGO_URL=mongodb://localhost:27017/minimal-todo
JWT_SECRET=seu_jwt_secret_aqui
FRONTEND_URL=http://localhost:5173
```

## 🚀 Executando o projeto

1. Inicie o MongoDB:
```bash
mongod
```

2. Inicie o backend:
```bash
cd api
npm start
```

3. Em outro terminal, inicie o frontend:
```bash
npm run dev
```

4. Acesse o aplicativo em `http://localhost:5173`

## 👥 Usuários

- **Admin**: admin/admin
- **Usuário comum**: Registre-se através da interface

## 📝 Estrutura do Projeto

```
minimal-todo/
├── src/
│   ├── components/     # Componentes React reutilizáveis
│   ├── hooks/         # Hooks personalizados
│   ├── pages/         # Páginas da aplicação
│   ├── utils/         # Funções utilitárias
│   └── assets/        # Recursos estáticos
├── api/
│   ├── controllers/   # Controladores da API
│   ├── models/        # Modelos do MongoDB
│   ├── routes/        # Rotas da API
│   └── middlewares/   # Middlewares
└── public/            # Arquivos públicos
```

## 🔒 Segurança

- Senhas são hasheadas com bcrypt
- Autenticação via JWT
- Proteção contra CSRF
- Validação de dados
- Rate limiting
- Sanitização de inputs

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## ✨ Agradecimentos

- [tweek.so](https://tweek.so) pela inspiração
- [React](https://reactjs.org)
- [MongoDB](https://www.mongodb.com)
- [Node.js](https://nodejs.org)

---
# Minimaltodo
