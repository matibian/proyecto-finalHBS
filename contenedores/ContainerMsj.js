const { optionsSQLite } = require("./options/sqlite.js");

const knex = require("knex")(optionsSQLite);

class ContenedorMsg {
    constructor(table) {
        this.table = table;
    }

    getAll = async () => {
        try {
            const mensajes = await knex(this.table).select("*");
            if (mensajes.length > 0) {
                return mensajes;
            } else {
                return [];
            }
        } catch (error) {
            console.log(`Ocurrio un error: ${error}`);

        }
    };



    save = async (mensaje) => {
        try {
            await knex(this.table).insert(mensaje)
            console.log('registro creado:', mensaje);

        } catch (error) {
            console.log(`Ocurrio un error: ${error}`);
        }

    };

}

module.exports = ContenedorMsg;
