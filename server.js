const express = require("express");
const { Router } = express;
const Container = require("./contenedores/Container.js");
const ContenedorMsg = require("./contenedores/contenedorMsjArchivo");
// const ContenedorFaker = require("./contenedores/ContainerFake");
// const { normalize, schema, denormalize } = require("normalizr");
const { engine } = require("express-handlebars");
const app = express();
const mongoose = require("mongoose");
const log4js = require("log4js");
const config = require("./config/config");

console.log(`NODE_ENV=${config.NODE_ENV}`);

const httpServer = require("http").createServer(app);
const routesViews = require("./routes/views");
// const routesCart = require("./routes/cart");
// const routesProducts = require("./routes/products");

httpServer.listen(config.PORT, () =>
  console.log(`App listening on http://${config.HOST}:${config.PORT}`)
);

const contenedor = new Container("productos");
const contenedorMsg = new ContenedorMsg("mensajes");
// const prodFaker = new ContenedorFaker();

const io = require("socket.io")(httpServer);

const moment = require("moment");
const timestamp = moment().format("lll");

const MongoStore = require("connect-mongo");
const session = require("express-session");
const Usuarios = require("./models/loginsModel");

app.use(express.static(__dirname + "/public"));

app.set("view engine", "hbs");
app.set("views", "./views");
app.engine(
  "hbs",
  engine({
    extname: ".hbs",
    defaultLayout: "index.hbs",
    layoutsDir: __dirname + "/views/layouts",
    partialsDir: __dirname + "/views/partials",
  })
);

////////logger//////////
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

///////passport/////////
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");

function isValidPassword(user, password) {
  return bcrypt.compareSync(password, user.password);
}

function createHash(password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(10), null);
}

mongoose
  .connect(
    "mongodb+srv://tamara:123456Coder@cluster0.u37xyzn.mongodb.net/Proyecto-back"
  )
  .then(() => console.log("Connected to Mongo"))
  .catch((e) => {
    console.error(e);
    throw "can not connect to the mongo!";
  });

passport.use(
  "login",
  new LocalStrategy((username, password, done) => {
    Usuarios.findOne({ username }, (err, user) => {
      if (err) return done(err);

      if (!user) {
        console.log("No existe el usuario " + username);
        return done(null, false);
      }

      if (!isValidPassword(user, password)) {
        console.log("Password inválido");
        return done(null, false);
      }

      return done(null, user);
    });
  })
);

passport.use(
  "signup",
  new LocalStrategy(
    {
      passReqToCallback: true,
    },
    (req, username, password, done) => {
      Usuarios.findOne({ username: username }, function (err, user) {
        if (err) {
          logger.error("Error en el logueo: " + err);
          return done(err);
        }

        if (user) {
          console.log("Ya existe el usuario");
          return done(null, false);
        }

        const newUser = {
          username: username,
          password: createHash(password),
        };
        Usuarios.create(newUser, (err, userWithId) => {
          if (err) {
            logger.error("Error al guardar el usuario: " + err);
            return done(err);
          }
          console.log(user);
          console.log("Registración exitosa");
          return done(null, userWithId);
        });
      });
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser((id, done) => {
  Usuarios.findById(id, done);
});

/////////// SESION //////////

app.use(
  session({
    store: MongoStore.create({
      mongoUrl:
        "mongodb+srv://matubianchi:1234@cluster0.u37xyzn.mongodb.net/Proyecto-back",
      mongoOptions: {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      },
      ttl: 10 * 60,
    }),
    secret: "secreto",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// function auth(req, res, next) {
//   if (req.session.user) {
//     return next();
//   } else {
//     // res.status(401).send("error de autorización!")
//     return res.redirect("/login");

//   }
// }

function checkAuthentication(req, res, next) {
  if (req.isAuthenticated()) {
    next();
  } else {
    res.redirect("/login");
  }
}

// app.get("/api/productos-test", async (req, res) => {
//   const prodFake = prodFaker.getProd(5);
//   res.render("productosFake", {
//     title: "Test",
//     prodFake,
//     layout: "productosFake",
//   });
//   // res.json(prodFake);
// });

// Normalizr

// const authorSchema = new schema.Entity("authors", {}, { idAttribute: "email" });
// const messageSchema = new schema.Entity("messages", {
//   author: authorSchema,
// });

// const chatSchema = new schema.Entity("chats", {
//   messages: [messageSchema],
// });

// const normalizarData = (data) => {
//   const dataNormalizada = normalize(
//     { id: "chatHistory", messages: data },
//     chatSchema
//   );
//   return dataNormalizada;
// };

// const normalizarMensajes = async () => {
//   const messages = await contenedorMsg.getAll();
//   const normalizedMessages = normalizarData(messages);
//   return normalizedMessages;
// };

// ///// Conexion socket

// io.on("connection", async (socket) => {
//   console.log(`Nuevo cliente conectado ${socket.id}`);

//   socket.emit("product-list", await contenedor.getAll());

//   socket.emit("msg-list", await contenedorMsg.getAll());

//   socket.on("product", async (data) => {
//     console.log(data);

//     await contenedor.save(data);

//     console.log("Se recibio un producto nuevo", "producto:", data);

//     io.emit("product-list", await contenedor.getAll());
//   });

//   socket.on("del-product", async (data) => {
//     console.log(data);

//     await contenedor.deleteById(data);
//     io.emit("product-list", await contenedor.getAll());
//   });

//   socket.on("msg", async (data) => {
//     await contenedorMsg.save({
//       socketid: socket.id,
//       timestamp: timestamp,
//       ...data,
//     });

//     console.log("Se recibio un msg nuevo", "msg:", data);

//     io.emit("msg-list", await contenedorMsg.getAll());
//   });
// });

app.get("/", checkAuthentication, routesViews.getRoot);

app.get("/category/:category", checkAuthentication, routesViews.getCategory);

app.get("/logout", routesViews.getLogout);

app.get("/login", routesViews.getLogin);

app.post(
  "/login",
  passport.authenticate("login", { failureRedirect: "/faillogin" }),
  routesViews.postLogin
);

// app.get("/faillogin", routes.getFailLogin);

app.get("/faillogin", routesViews.getFailLogin);

app.get("/failsignup", routesViews.getFailSignup);

app.get("/registro", routesViews.getRegistro);

app.get("/profile", routesViews.getProfile);

app.post(
  "/registro",
  passport.authenticate("signup", { failureRedirect: "/failsignup" }),
  routesViews.postRegistro
);

app.get("/cart", checkAuthentication, routesViews.getCart);

app.post("/checkout", checkAuthentication, routesViews.postCheckout);

app.post("/cart/prod/:id", checkAuthentication, routesViews.postProdCart);

app.post("/cart/add/:id", checkAuthentication, routesViews.postAdd);

app.post("/cart/subs/:id", checkAuthentication, routesViews.postSubs);

app.post(
  "/cart/prodDel/:id",
  checkAuthentication,
  routesViews.postDelProductCart
);

// app.get("/failregistro", routes.getFailRegistro);

app.get("/checkout", routesViews.getCheckout);
