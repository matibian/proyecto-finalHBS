const { optionsMYSQL } = require("../options/mysql.js");
const knex = require("knex")(optionsMYSQL);

module.exports = class Container {
  constructor(table) {
    this.table = table;
  }

  getAll = async () => {
    try {
      const productos = await knex(this.table).select("*");
      if (productos.length > 0) {
        return productos;
      } else {
        return [];
      }
    } catch (e) {
      console.log(e);
    } 
  //   finally {
  //     knex.destroy()
  // };
  }


  save = async (producto) => {

    await knex(this.table)
      .insert(producto)
      .then(() => console.log("registro creado:", producto))
      .catch((err) => {console.log(err); throw err;})
      // .finally(()=> {
      //   knex.destroy()
      // })
  };

  // getById = async (id) => {
  //   await knex
  //   .from(this.table)
  //   .select("id", "=", id)
  //   .then(() => console.log("registro creado:", producto))
  //   .catch((err) => {console.log(err); throw err;})
  //   // .finally(()=> {
  //   //   knex.destroy()
  //   // })
  // };

  deleteById = async (id) => {
    try {
      await knex(this.table)
      .where("id", id)
      .del()
      .then(() => console.log("Producto eliminado"))
    } catch (e) {
      console.log(e);
    }
    // knex(this.table)
    //   .where("id", "=", id)
    //   .del()
    //   .then(() => console.log("Producto eliminado"))
    //   .catch((err) => {console.log(err); throw err;})
    //   .finally(()=> {
    //     knex.destroy()
    //   })

  };

  // updateById = async (id, name, price) => {
  //   try {
  //     const productos = await this.getAll();
  //     const item = productos.find((prod) => prod.id === Number(id));
  //     if (item) {
  //       item.name = name;
  //       item.price = price;
  //       const dataJSON = JSON.stringify(productos);
  //       // item.thumbnail = thumbnail;
  //       await fs.promises.writeFile("./api/productos.json", dataJSON);
  //       return item;
  //     } else {
  //       return { error: "Producto no encontrado" };
  //     }
  //   } catch (error) {
  //     throw new Error(error);
  //   }
  // };

  deleteAll = async () => {
    knex
    .from(this.table)
    .del()
    .then(() => console.log("Productos eliminados"))
    .catch((err) => {console.log(err); throw err;})
    .finally(()=> {
      knex.destroy()
    })
  };
}
