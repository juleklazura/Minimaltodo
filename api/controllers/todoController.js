const Todo = require('../models/Todo');

exports.getTodos = async (req, res) => {
  const todos = await Todo.find({ user: req.user.id }).sort({ createdAt: -1 });
  res.json(todos);
};

exports.createTodo = async (req, res) => {
  const { text, date } = req.body;
  if (!text || !date) return res.status(400).json({ error: 'Texto e data são obrigatórios' });
  const todo = await Todo.create({ text, date, user: req.user.id });
  res.status(201).json(todo);
};

exports.updateTodo = async (req, res) => {
  const { id } = req.params;
  const { done } = req.body;
  const todo = await Todo.findOneAndUpdate({ _id: id, user: req.user.id }, { done }, { new: true });
  if (!todo) return res.status(404).json({ error: 'Tarefa não encontrada' });
  res.json(todo);
};

exports.deleteTodo = async (req, res) => {
  const { id } = req.params;
  const todo = await Todo.findOneAndDelete({ _id: id, user: req.user.id });
  if (!todo) return res.status(404).json({ error: 'Tarefa não encontrada' });
  res.json({ ok: true });
}; 