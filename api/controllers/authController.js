const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

exports.register = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'Nome, email e senha obrigatórios' });
  const existsEmail = await User.findOne({ email });
  if (existsEmail) return res.status(400).json({ error: 'Email já cadastrado' });
  const existsName = await User.findOne({ name });
  if (existsName) return res.status(400).json({ error: 'Nome de usuário já cadastrado' });
  const hash = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, password: hash, username: email });
  res.status(201).json({ ok: true });
};

exports.login = async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ $or: [ { email: username }, { name: username } ] });
  if (!user) return res.status(400).json({ error: 'Usuário ou senha inválidos' });
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(400).json({ error: 'Usuário ou senha inválidos' });
  const token = jwt.sign({ id: user._id, username: user.name, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user: { username: user.name, role: user.role } });
}; 