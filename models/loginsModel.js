const mongoose = require("mongoose");
const findOrCreate = require('mongoose-findorcreate');

const UsuarioSchema = new mongoose.Schema({
  username: { type: String, required: true, max: 100 },
  password: { type: String, required: true, max: 100 },


});
UsuarioSchema.plugin(findOrCreate)

const Usuarios = mongoose.model("login", UsuarioSchema);
module.exports = Usuarios;
