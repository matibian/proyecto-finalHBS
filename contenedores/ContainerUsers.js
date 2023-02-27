const mongoose = require("mongoose");
const MongoDBService = require("../services/services.js");
const UsuariosProd = require("../models/usersModel");

class ContenedorMongoDB {
  constructor() {
    this.model = mongoose.model("users", UsuariosProd);
    // MongoDBService.init();
  }

  async getAll(username) {
    if (username) {
      const user = await this.model.findOne({ username: username }).lean();
      console.log(1, user);
      console.log(1, username);
      return user;
    } else {
      return "usuario no encontrado";
    }
  }

  async save(element) {
    const response = await this.model.create(element);

    return response;
  }

  async updateById(username, newData) {
    const response = await this.model.findByIdAndUpdate(username, newData, {
      new: true,
    });
    return response;
  }

  async deleteById(username) {
    const response = await this.collection.findByIdAndDelete(username);
    return response;
  }
}

module.exports = ContenedorMongoDB;
