const fs = require('fs');


class ContenedorMsjArchivo {
    constructor(fileName) {
        this.filePath = './DB/mensajes.json';
    }

    getAll = async () => {
        try {
            const archivo = await fs.promises.readFile(this.filePath);
            const mensajes = JSON.parse(archivo);
            console.log(`Se obtuvo el listado completo de mensajes`);

            return mensajes;
        } catch (error) {
            console.log(`Ocurrio un error: ${error}`);

        }
    };

    syncGetAll = () => {
        try {
            const archivo = fs.readFileSync(this.filePath);
            const mensajes = JSON.parse(archivo);
            return mensajes;
        } catch (error) {
            console.log(`Ocurrio un error: ${error}`);

        }
    };



    save = async (mensaje) => {
        try {
            const mensajes = await this.getAll();

            const id = mensajes.length === 0 ? 1 : mensajes[mensajes.length - 1].id + 1;

            mensaje.id = id;

            mensajes.push(mensaje);

            await fs.promises.writeFile(this.filePath, JSON.stringify(mensajes, null, 3));

            console.log(`Se salvo el mensaje con el id ${id}`);

        } catch (error) {
            console.log(`Ocurrio un error: ${error}`);
        }

    };



}

module.exports = ContenedorMsjArchivo;

