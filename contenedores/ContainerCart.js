const mongoose = require("mongoose");
const MongoDBService = require("../services/services.js");
const UsuariosProd = require("../models/usersModel");
const ContainerProd = require("../contenedores/ContainerProd");
const ContProd = new ContainerProd();
const ContainerUsers = require("../contenedores/ContainerUsers");
const { listenerCount } = require("../models/usersModel");
const ContUsers = new ContainerUsers();

class ContenedorMongoDB {
  constructor() {
    this.model = mongoose.model("users", UsuariosProd);
    // MongoDBService.init();
  }

  async getAll(username) {
    if (username) {
      const user = await this.model.findOne({ username: username }).cart.lean();

      return user;
    } else {
      return "usuario no encontrado";
    }
  }

  async postById(user, id, timestamp) {
    let prod = {};
    try {
      const userCart = await this.model.findOne(user._id);
      if (!userCart.cart.find((p) => p._id == id)) {
        prod = await ContProd.getById(id);
        prod.timestamp = await timestamp;
        prod.quant = 1;
        userCart.cart.push(prod);
        await userCart.save();
      } else {
        const userCart = await this.model.findOne(user._id);
        const productIndex = await userCart.cart.findIndex(
          (product) => product._id == id
        );
        await userCart.cart[productIndex].quant++;
        userCart.markModified("cart");
        await userCart.save();
      }
    } catch (e) {
      console.log(e);
    }
  }

  async deleteById(user, id) {
    this.model
      .findById(user._id)
      .then((user) => {
        const productIndex = user.cart.findIndex(
          (product) => product._id.toString() === id
        );
        user.cart.splice(productIndex, 1);
        return user.save();
      })
      .then((user) => {
        console.log("User updated:", user);
      })
      .catch((error) => {
        console.error(error);
      });
  }

  async addById(user, id) {
    const userCart = await this.model.findOne(user._id);
    const productIndex = await userCart.cart.findIndex(
      (product) => product._id == id
    );
    await userCart.cart[productIndex].quant++;
    userCart.markModified("cart");
    await userCart.save();
  }

  async subsById(user, id) {
    const userCart = await this.model.findOne(user._id);
    const productIndex = await userCart.cart.findIndex(
      (product) => product._id == id
    );
    if (userCart.cart[productIndex].quant == 1) {
      this.deleteById(user, id);
    } else {
      await userCart.cart[productIndex].quant--;
      userCart.markModified("cart");
      await userCart.save();
    }
  }

  // async getById(id) {
  //   const response = await this.model.findById(id);

  //   return response;
  // }

  async updateById(username, newData) {
    const response = await this.model.findByIdAndUpdate(username, newData, {
      new: true,
    });
    return response;
  }

  async deleteCart(user) {
    this.model
      .findById(user._id)
      .then((user) => {
        user.cart = [];
        return user.save();
      })
      .then((user) => {
        console.log("User updated:", user);
      })
      .catch((error) => {
        console.error(error);
      });
  }
}

module.exports = ContenedorMongoDB;
