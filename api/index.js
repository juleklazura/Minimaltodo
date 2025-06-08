import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from './models/User.js';
import Todo from './models/Todo.js';

import todoRoutes from './routes/todoRoutes.js';
import authRoutes from './routes/authRoutes.js';

const app = express();
const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

// CORS configurado para aceitar múltiplos domínios do .env
const allowedOrigins = process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : [];
app.use(cors({
  origin: function (origin, callback) {
    // Permite requests sem origin (ex: mobile, curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    } else {
      return callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: process.env.CORS_CREDENTIALS === 'true'
}));
app.use(express.json());

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

// Não coloque código de frontend aqui!
