const mongoose = require("mongoose");
const findOrCreate = require("mongoose-findorcreate");

const productModel = new mongoose.Schema({
  name: { type: String, required: true, max: 100 },
  description: { type: String, required: true, max: 150 },
  code: { type: String, required: true, max: 10 },
  thumbnail: { type: String, required: true, max: 150 },
  price: { type: Number, required: true },
  stock: { type: Number, required: true, default: 1 },
  timestamp: { type: String, required: true, max: 100 },
  quant: { type: Number, required: false },
  category: { type: String, required: false },
});

// UsuarioSchema.plugin(findOrCreate);

// const Products = mongoose.model("productos", productModel);
module.exports = productModel;
