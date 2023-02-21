const mongoose = require("mongoose");
const MongoDBService = require("../services/services.js");
const productModel = require("../models/productModel.js");

class ContainerProd {
  constructor() {
    this.model = mongoose.model("productos", productModel);
    // MongoDBService.init();
  }

  async getAll(id) {
    const products = await this.model.find({}).lean();
    return products;
  }

  async save(element) {
    const response = await this.model.create(element);

    return response;
  }

  async getById(id) {
    const response = await this.model.findById(id);

    return response;
  }

  async deleteById(id) {
    const response = await this.collection.findByIdAndDelete(id);
    return response;
  }

  async updateById(id, newData) {
    const response = await this.model.findByIdAndUpdate(id, newData, {
      new: true,
    });
    return response;
  }

  async getByCategory(category) {
    const products = await this.model
      .find()
      .where({ category: category })
      .lean();
    console.log(category);
    console.log(products);
    return products;
  }
}

module.exports = ContainerProd;
