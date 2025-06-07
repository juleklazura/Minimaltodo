const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  username: { type: String, unique: true, sparse: true },
  password: { type: String }, // hash
  role: { type: String, default: 'user' } // 'user' ou 'admin'
})

module.exports = mongoose.model('User', userSchema) 