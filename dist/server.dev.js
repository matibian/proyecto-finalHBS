"use strict";

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var express = require("express");

var Router = express.Router;

var Container = require("./contenedores/Container.js");

var ContenedorMsg = require("./contenedores/contenedorMsjArchivo"); // const ContenedorFaker = require("./contenedores/ContainerFake");
// const { normalize, schema, denormalize } = require("normalizr");


var _require = require("express-handlebars"),
    engine = _require.engine;

var app = express();

var mongoose = require("mongoose");

var config = require("./config/config");

console.log("NODE_ENV=".concat(config.NODE_ENV));

var httpServer = require("http").createServer(app);

var routes = require("./routes/views");

httpServer.listen(config.PORT, function () {
  return console.log("App listening on http://".concat(config.HOST, ":").concat(config.PORT));
});
var contenedor = new Container("productos");
var contenedorMsg = new ContenedorMsg("mensajes"); // const prodFaker = new ContenedorFaker();

var io = require("socket.io")(httpServer);

var moment = require("moment");

var timestamp = moment().format("lll");

var MongoStore = require("connect-mongo");

var session = require("express-session");

var Usuarios = require("./models/usuarios");

app.use(express["static"](__dirname + "/public"));
app.set("view engine", "hbs");
app.set("views", "./views");
app.engine("hbs", engine({
  extname: ".hbs",
  defaultLayout: "index.hbs",
  layoutsDir: __dirname + "/views/layouts",
  partialsDir: __dirname + "/views/partials"
})); ///////passport/////////

var passport = require("passport");

var LocalStrategy = require("passport-local").Strategy;

var bcrypt = require("bcrypt");

function isValidPassword(user, password) {
  return bcrypt.compareSync(password, user.password);
}

function createHash(password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(10), null);
}

mongoose.connect("mongodb+srv://tamara:123456Coder@cluster0.u37xyzn.mongodb.net/Proyecto-back").then(function () {
  return console.log("Connected to Mongo");
})["catch"](function (e) {
  console.error(e);
  throw "can not connect to the mongo!";
});
passport.use("login", new LocalStrategy(function (username, password, done) {
  Usuarios.findOne({
    username: username
  }, function (err, user) {
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
}));
passport.use("signup", new LocalStrategy({
  passReqToCallback: true
}, function (req, username, password, done) {
  Usuarios.findOne({
    username: username
  }, function (err, user) {
    if (err) {
      console.log("Error en el logueo: " + err);
      return done(err);
    }

    if (user) {
      console.log("Ya existe el usuario");
      return done(null, false);
    }

    var newUser = {
      username: username,
      password: createHash(password)
    };
    Usuarios.create(newUser, function (err, userWithId) {
      if (err) {
        console.log("Error al guardar el usuario: " + err);
        return done(err);
      }

      console.log(user);
      console.log("Registración exitosa");
      return done(null, userWithId);
    });
  });
}));
passport.serializeUser(function (user, done) {
  done(null, user._id);
});
passport.deserializeUser(function (id, done) {
  Usuarios.findById(id, done);
}); /////////// SESION //////////

app.use(session({
  store: MongoStore.create({
    mongoUrl: "mongodb+srv://tamara:123456Coder@cluster0.u37xyzn.mongodb.net/Proyecto-back",
    mongoOptions: {
      useNewUrlParser: true,
      useUnifiedTopology: true
    },
    ttl: 10 * 60
  }),
  secret: "secreto",
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.json());
app.use(express.urlencoded({
  extended: true
})); // function auth(req, res, next) {
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
} // app.get("/api/productos-test", async (req, res) => {
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
///// Conexion socket


io.on("connection", function _callee4(socket) {
  return regeneratorRuntime.async(function _callee4$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          console.log("Nuevo cliente conectado ".concat(socket.id));
          _context4.t0 = socket;
          _context4.next = 4;
          return regeneratorRuntime.awrap(contenedor.getAll());

        case 4:
          _context4.t1 = _context4.sent;

          _context4.t0.emit.call(_context4.t0, "product-list", _context4.t1);

          _context4.t2 = socket;
          _context4.next = 9;
          return regeneratorRuntime.awrap(contenedorMsg.getAll());

        case 9:
          _context4.t3 = _context4.sent;

          _context4.t2.emit.call(_context4.t2, "msg-list", _context4.t3);

          socket.on("product", function _callee(data) {
            return regeneratorRuntime.async(function _callee$(_context) {
              while (1) {
                switch (_context.prev = _context.next) {
                  case 0:
                    console.log(data);
                    _context.next = 3;
                    return regeneratorRuntime.awrap(contenedor.save(data));

                  case 3:
                    console.log("Se recibio un producto nuevo", "producto:", data);
                    _context.t0 = io;
                    _context.next = 7;
                    return regeneratorRuntime.awrap(contenedor.getAll());

                  case 7:
                    _context.t1 = _context.sent;

                    _context.t0.emit.call(_context.t0, "product-list", _context.t1);

                  case 9:
                  case "end":
                    return _context.stop();
                }
              }
            });
          });
          socket.on("del-product", function _callee2(data) {
            return regeneratorRuntime.async(function _callee2$(_context2) {
              while (1) {
                switch (_context2.prev = _context2.next) {
                  case 0:
                    console.log(data);
                    _context2.next = 3;
                    return regeneratorRuntime.awrap(contenedor.deleteById(data));

                  case 3:
                    _context2.t0 = io;
                    _context2.next = 6;
                    return regeneratorRuntime.awrap(contenedor.getAll());

                  case 6:
                    _context2.t1 = _context2.sent;

                    _context2.t0.emit.call(_context2.t0, "product-list", _context2.t1);

                  case 8:
                  case "end":
                    return _context2.stop();
                }
              }
            });
          });
          socket.on("msg", function _callee3(data) {
            return regeneratorRuntime.async(function _callee3$(_context3) {
              while (1) {
                switch (_context3.prev = _context3.next) {
                  case 0:
                    _context3.next = 2;
                    return regeneratorRuntime.awrap(contenedorMsg.save(_objectSpread({
                      socketid: socket.id,
                      timestamp: timestamp
                    }, data)));

                  case 2:
                    console.log("Se recibio un msg nuevo", "msg:", data);
                    _context3.t0 = io;
                    _context3.next = 6;
                    return regeneratorRuntime.awrap(contenedorMsg.getAll());

                  case 6:
                    _context3.t1 = _context3.sent;

                    _context3.t0.emit.call(_context3.t0, "msg-list", _context3.t1);

                  case 8:
                  case "end":
                    return _context3.stop();
                }
              }
            });
          });

        case 14:
        case "end":
          return _context4.stop();
      }
    }
  });
});
app.get("/", checkAuthentication, routes.getRoot);
app.get("/showsession", routes.getShowsession);
app.get("/logout", routes.getLogout);
app.get("/login", routes.getLogin);
app.post("/login", passport.authenticate("login", {
  failureRedirect: "/faillogin"
}), routes.postLogin); // app.get("/faillogin", routes.getFailLogin);

app.get("/faillogin", routes.getFailLogin);
app.get("/failsignup", routes.getFailSignup);
app.get("/registro", routes.getRegistro);
app.post("/registro", passport.authenticate("signup", {
  failureRedirect: "/failsignup"
}), routes.postRegistro); // app.get("/failregistro", routes.getFailRegistro);

app.get("/privado", checkAuthentication, routes.getPrivado);
app.get("/carrito", checkAuthentication, routes.getCarrito);
app.get("/info", routes.getInfo);
app.get("/api/random", routes.getApirandom);