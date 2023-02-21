const mongoose = require("mongoose");

const init = async () => {
  try {
    mongoose.connect(
      `mongodb+srv://${proces.env.USERMONGO}:${proces.env.PASSMONGO}@cluster0.u37xyzn.mongodb.net/Proyecto-back`,
      { useNewUrlParser: true }
    );
    console.log("Conectado a MONGODB");
  } catch (error) {
    console.log(error);
  }
};

const MongoDBService = {
  init,
};

module.exports = { MongoDBService };
