const mongoose = require("mongoose");
const findOrCreate = require("mongoose-findorcreate");

const UsuarioSchema = new mongoose.Schema({
  username: { type: String, required: true, max: 100 },
  password: { type: String, required: true, max: 100 },
  name: { type: String, required: true, max: 50 },
  dir: { type: String, required: true, max: 50 },
  age: { type: Number, required: true, max: 100 },
  phone: { type: Number, required: true },
  avatar: { type: String, required: true, max: 100 },
  cart: { type: Array, required: false, max: 100 },
});
UsuarioSchema.plugin(findOrCreate);

const UsuariosProd = mongoose.model("usersprod", UsuarioSchema);
module.exports = UsuarioSchema;
