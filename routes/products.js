// routerProductos.get("/", async (req, res) => {
//     try {
//       const productos = await producto.getAll();
//       res.json(productos);
//     } catch (error) {
//       res.json({ error: true, msj: "error" });
//     }
//   });
  
//   routerProductos.get("/:id", async (req, res) => {
//     const id = req.params.id;
//     res.json((await producto.getById(id)) ?? { error: "no encontrado" });
//   });
  
//   routerProductos.post(
//     "/",
//     async (req, res, next) => {
//       if (isAdmin === true) {
//         next();
//       } else {
//         return res
//           .status(401)
//           .json({ error: -1, descripcion: "ruta 'x' método 'y' no autorizada" });
//       }
//     },
//     async (req, res) => {
//       try {
//         const { body } = req;
//         body.timestamp = Date.now();
//         producto.save(body);
//         // res.json("ok");
//       } catch (error) {
//         res.json({ error: true, msj: "error" });
//       }
//     }
//   );
  
//   routerProductos.put(
//     "/:id",
//     async (req, res, next) => {
//       if (isAdmin === true) {
//         next();
//       } else {
//         return res
//           .status(401)
//           .json({ error: -1, descripcion: "ruta 'x' método 'y' no autorizada" });
//       }
//     },
//     async (req, res) => {
//       try {
//         const { id } = req.params;
//         const { name, price } = req.body;
//         console.log(name, price, id);
//         await producto.updateById(id, name, price);
//         res.json({ succes: true });
//       } catch (error) {
//         res.json({ error: true, msj: "error" });
//       }
//     }
//   );
  
//   routerProductos.delete(
//     "/:id",
//     async (req, res, next) => {
//       if (isAdmin === true) {
//         next();
//       } else {
//         return res
//           .status(401)
//           .json({ error: -1, descripcion: "ruta 'x' método 'y' no autorizada" });
//       }
//     },
//     async (req, res) => {
//       try {
//         const id = req.params.id;
//         producto.deleteById(id);
//         res.send("Eliminado");
//       } catch (error) {
//         res.json({ error: true, msj: "error" });
//       }
//     }
//   );

// module.exports = {

// }