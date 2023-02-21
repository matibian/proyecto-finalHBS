const socket = io();

const authorSchema = new normalizr.schema.Entity(
  "authors",
  {},
  { idAttribute: "email" }
);
const messageSchema = new normalizr.schema.Entity("messages", {
  author: authorSchema,
});

const chatSchema = new normalizr.schema.Entity("chats", {
  messages: [messageSchema],
});

function enviarMsg() {
  const msgParaEnvio = document.getElementById("inputMsg").value;
  const email = document.getElementById("input-email").value;
  const nombre = document.getElementById("input-nombre").value;
  const apellido = document.getElementById("input-apellido").value;

  socket.emit("msg", {
    author: { email: email, nombre: nombre, apellido: apellido },
    mensaje: msgParaEnvio,
  });
  return false;
}

// Recibe mensajes del back y los renderiza en el DOM

socket.on("msg-list", (data) => {
  const dataNormLen = JSON.stringify(data).length;
  const dataMsg = normalizr.denormalize(data.result, chatSchema, data.entities);
  const dataDenormLen = JSON.stringify(dataMsg).length;
  const porc = (dataNormLen / dataDenormLen) * 100;
  let html = ` <br/> <h2>(COMPRESIÓN: %${porc.toFixed(2)} )</h3> <br/>`;
  dataMsg.messages.forEach((item) => {
    html += `
        <div class="msj-container" >
        <p class="p-email"><span style="font-weight: bolder; color: blue">${item.author.email} </span> <span style="color: red"> [${item.timestamp}] : <br> <span style= "color:green"> ${item.mensaje}</span> </p>
        </div> 
        `;
  });
  document.getElementById("mgs-area").innerHTML = html;
});

// Funcion para enviar productos el backend

async function postProducto() {
  const producto = await document.getElementById("productos").value;
  const precio = await document.getElementById("precio").value;
  const imagen = await document.getElementById("imagen").value;
  await socket.emit("product", {
    name: producto,
    price: precio,
    thumbnail: imagen,
  });
  return false;
}

async function eliminar(id) {
  await socket.emit("del-product", id);
  return false;
}

socket.on("product-list", (data) => {
  let html = "";

  data.forEach((item) => {
    html += `
            <tr>
            <td>${item.id} </th>
            <td>${item.name} </td>
            <td>$${item.price} </td>
            <td><img src="${item.thumbnail}" class="product-img"/></td>
            <td class="trash"><i class="fa-solid fa-trash" onclick="eliminar(${item.id})"></i> </td>
        `;
  });
  document.getElementById("tbodyProd").innerHTML = html;
});

function botonProd() {
  postProducto();
  e.preventDefault();
}

// function login(){
//     const username = document.getElementById("username").value;
//     const password = document.getElementById("password").value;

//     window.location.href = `http://localhost:8080/login?username=${username}&password=${password}`;
// }

function logout() {
  window.location.href = `/logout`;
}
