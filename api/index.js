import dotenv from 'dotenv';
dotenv.config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const Todo = require('./models/Todo');

const todoRoutes = require('./routes/todoRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
app.use(express.json());

const PORT = process.env.PORT || 4000;

const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// Middleware de autenticação
function auth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Token ausente' });
  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch {
    return res.status(401).json({ error: 'Token inválido' });
  }
}

// Criação automática do admin
async function ensureAdmin() {
  const admin = await User.findOne({ username: 'admin' });
  if (!admin) {
    const hash = await bcrypt.hash('admin', 10);
    await User.create({ username: 'admin', password: hash, role: 'admin', name: 'admin', email: 'admin@admin.com' });
    console.log('Usuário admin criado: admin/admin');
  }
}
ensureAdmin();

// Protege todas as rotas de todos
app.use('/todos', auth);

// Rotas
app.use('/todos', todoRoutes);
app.use('/auth', authRoutes);

// Conexão com MongoDB e start do servidor
mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 45000,
  connectTimeoutMS: 30000,
  retryWrites: true,
  retryReads: true,
  maxPoolSize: 10,
  minPoolSize: 5,
  maxIdleTimeMS: 60000,
})
  .then(() => {
    console.log('Conectado ao MongoDB');
    app.listen(PORT, () => {
      console.log('API rodando na porta', PORT);
    });
  })
  .catch(err => {
    console.error('Erro ao conectar no MongoDB:', err);
  });

const apiUrl = import.meta.env.VITE_API_URL;

// Função para registrar um novo usuário
async function registerUser(name, email, password) {
  const res = await fetch(`${apiUrl}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
    credentials: 'include'
  });
  return res.json();
}
