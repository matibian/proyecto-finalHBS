const parseArgs = require("minimist");
const { fork } = require("child_process");
const Container = require("../contenedores/Container");
const ContainerProd = require("../contenedores/ContainerProd");
const ContainerUsers = require("../contenedores/ContainerUsers");
const ContainerCart = require("../contenedores/ContainerCart");
const ContCart = new ContainerCart();
const contenedor = new Container("productos");
const ContUsers = new ContainerUsers();
const ContProd = new ContainerProd();
const nodemailer = require("nodemailer");
const moment = require("moment");
const timestamp = moment().format("lll");
const log4js = require("log4js");

const accountSid = "AC4ada19da4830b3546520242283a4a450";
const authToken = "fc5e0beec293595d08f160dec1d8be54";
const client = require("twilio")(accountSid, authToken);

log4js.configure({
  appenders: {
    logConsole: { type: "console" },
    logFile1: { type: "file", filename: "./logs/warn.log" },
    logFile2: { type: "file", filename: "./logs/error.log" },
  },
  categories: {
    default: { appenders: ["logConsole"], level: "info" },
    fileWarn: { appenders: ["logFile1", "logConsole"], level: "warn" },
    fileError: { appenders: ["logFile2", "logConsole"], level: "error" },
  },
});

let logger = log4js.getLogger();

const transporter = nodemailer.createTransport({
  service: "gmail",
  port: 587,
  auth: {
    user: "matubianchi@gmail.com",
    pass: "izxopsdqguskflhj",
  },
});

async function getRoot(req, res) {
  let products = await ContProd.getAll();
  let user = await ContUsers.getAll(req.session.user);
  res.render("inicio.hbs", {
    products: products,
    user: user,
  });
}

async function getCategory(req, res) {
  const category = req.params.category;
  let products = await ContProd.getByCategory(category);
  let user = await ContUsers.getAll(req.session.user);
  res.render("inicio.hbs", {
    products: products,
    user: user,
  });
}

async function getProfile(req, res) {
  const user = await ContUsers.getAll(req.session.user);
  res.render("profile", { user: user, layout: "profile" });
}

function getLogout(req, res) {
  const user = req.session.user;
  req.session.destroy((err) => {
    if (err) {
      logger.error(`// Route : http://localhost/logout // `, err);
      res.send("no pudo deslogear");
    } else {
      res.render("logout", { name: user, layout: "logout" });
    }
  });
}

// function getLogin(req, res) {

//     res.render("login", {title: "Login", layout : "login"} )

//   }
async function getLogin(req, res) {
  if (req.isAuthenticated()) {
    const { username, password } = req.user;

    // await ContUsers.getAll(user)
    // const user = { username, password };
    res.render("inicio.hbs", { username: req.session.user });
  } else {
    res.render("login", { title: "Login", layout: "login" });
  }
}

function getCheckout(req, res) {
  res.render("checkout", { layout: "checkout" });
}

async function getRegistro(req, res) {
  res.render("login", { title: "Registro", layout: "registro" });
}
async function getFailLogin(req, res) {
  logger.error(`// Route : http://localhost/filelogin  || Method: GET // `);
  res.render("faillogin", { layout: "faillogin" });
}
async function getFailSignup(req, res) {
  logger.error(`// Route : http://localhost/filesignup  || Method: GET // `);
  res.render("failsignup", { layout: "failsignup" });
}

async function postProdCart(req, res) {
  const id = req.params.id;
  const user = await ContUsers.getAll(req.session.user);
  await ContCart.postById(user, id, timestamp);
  res.redirect("back");
}

async function postDelProductCart(req, res) {
  const id = req.params.id;
  const user = await ContUsers.getAll(req.session.user);
  await ContCart.deleteById(user, id);
  res.redirect("/cart");
}

async function postAdd(req, res) {
  const id = req.params.id;
  const user = await ContUsers.getAll(req.session.user);
  await ContCart.addById(user, id);
  res.redirect("/cart");
}
async function postSubs(req, res) {
  const id = req.params.id;
  const user = await ContUsers.getAll(req.session.user);
  await ContCart.subsById(user, id);
  res.redirect("/cart");
}

async function postLogin(req, res) {
  console.log(req.body);
  const { username, password } = await req.body;

  req.session.user = username;
  // req.session.admin = true;
  res.redirect("/");
}

async function postRegistro(req, res) {
  user = req.body;
  user.cart = await [];
  await ContUsers.save(user);
  const mailOptions = {
    from: "Servidor Node.js",
    to: "dev.matiasbianchi@gmail.com",
    subject: "Nuevo registro",
    html: `<h1>Nuevo registro de Vortex</h1><br/><ul> <li>Usuario: ${user.username}</li> <li>Nombre: ${user.name}</li> <li>Edad: ${user.age}</li> <li>Dirección: ${user.dir}</li> <li>Teléfono: ${user.phone}</li> <li>Avatar: <img src="${user.avatar}"></li></ul>`,
    // attachments: [{ path: "https://www.nationalgeographic.com.es/medio/2022/12/12/leon-1_b21b27e1_221212155936_1280x720.jpg"}]
  };

  try {
    const info = transporter.sendMail(mailOptions);
    logger.info("// Route : http://localhost/registro", info);
  } catch (err) {
    logger.error(`// Route : http://localhost/registro // `, err);
  }

  const { username, password } = await req.body;
  req.session.user = username;
  res.redirect("/");
}

async function postCheckout(req, res) {
  const user = await ContUsers.getAll(req.session.user);
  const cart = user.cart;
  let string = "";
  const pedido = () => {
    string =
      "<table style='border:1px solid #333'><thead> <tr> <th> # </th> <th>Producto</th> <th>Precio</th> <th>Cantidad</th> </tr></thead> <tbody border='0' cellspacing='0' cellpadding='0' style='text-align:center'>";
    cart.forEach((e, i) => {
      string += `<tr> <td>${i + 1} </td> <td>${e.name} </td><td>${
        e.price
      } </td><td>${e.quant}</td> </tr>`;
    });
    string += "</tbody></table>";
    return string;
  };
  const mailOptions = {
    from: "Servidor Node.js",
    to: ["dev.matiasbianchi@gmail.com", user.username],
    subject: `Nuevo pedido de ${user.name}, ${user.username}`,
    html:
      `<h1>Nuevo pedido</h1><h3>Usuario</h1><br/><ul> <li>Usuario: ${user.username}</li> <li>Nombre: ${user.name}</li><li>Dirección: ${user.dir}</li> <li>Teléfono: ${user.phone}</li> </ul><h3>Pedido:</h3>` +
      pedido(),
  };

  try {
    const info = transporter.sendMail(mailOptions);
    logger.info("// Route : http://localhost/checkout", info);
  } catch (err) {
    logger.error(`// Route : http://localhost/checkout // `, err);
  }

  /////whatsapp/////

  const body = `Nuevo pedido de ${user.name}, ${user.username}`;

  client.messages
    .create({
      body: body,
      from: "whatsapp:+14155238886",
      to: `whatsapp:+5492215571916`,
    })
    .then((message) => console.log(message.sid))
    .catch((err) => {
      logger.error(`// Route : http://localhost/checkout // `, err);
    });

  ///////SMS////////

  try {
    client.messages
      .create({
        from: "+16292764264",
        body: "Se pedido ha sido registrado y se encuentra en proceso",
        to: `+54${user.phone}`,
      })
      .then((message) => console.log(message));
  } catch (err) {
    logger.error(`// Route : http://localhost/checkout // `, err);
  }

  await ContCart.deleteCart(user);
  res.redirect("/checkout");
}

async function getCart(req, res) {
  let user = await ContUsers.getAll(req.session.user);
  let total = await user.cart.reduce(
    (acumulador, producto) => acumulador + producto.price * producto.quant,
    0
  );
  res.render("login", {
    title: "Cart",
    user: user,
    total: total,
    layout: "cart",
  });
}

function getInfo(req, res) {
  //   Agregar una ruta '/info' que presente en una vista sencilla los siguientes datos:
  // - Argumentos de entrada
  const argumentos = JSON.stringify(parseArgs(process.argv.slice(2))._);
  // - Path de ejecución
  const path = JSON.stringify(process.env.PATH);
  // - Process id
  const PID = process.pid;
  // - Versión de node.js
  const version = process.version;
  // - Carpeta del proyecto
  const carpeta = process.env.PWD;
  // - Nombre de la plataforma (sistema operativo)
  const OS = process.platform;
  // - Memoria total reservada (rss)
  const memoryUsage = process.memoryUsage().rss;

  const data = {
    argumentos: argumentos,
    path: path,
    PID: PID,
    version: version,
    carpeta: carpeta,
    OS: OS,
    memoryUsage: memoryUsage,
  };
}

module.exports = {
  getRoot,
  getLogout,
  getLogin,
  postLogin,
  getRegistro,
  postRegistro,
  getFailLogin,
  getFailSignup,
  getCart,
  postCheckout,
  postProdCart,
  postDelProductCart,
  getCheckout,
  getProfile,
  getCategory,
  postAdd,
  postSubs,
};
