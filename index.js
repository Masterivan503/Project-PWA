const path = require("path");
const express = require("express");
//importamos mongoose
const mongoose = require('mongoose');

const app = express();

const socketIO = require("socket.io");
const { Socket } = require("dgram");
const { type } = require("os");


//Conectamos con MongoDB
mongoose.connect("mongodb://localhost:27017/chat-real",{
  //useNewUrlParser: true,
  //useUnifiedTopology: true
})
.then(()=> console.log("Conexion con exito MongoBD"))
.catch(err => console.error("Error al conectar a MongoDB :("));

//Definimos esquema y modelo para los datos
const mensajeSchema = new mongoose.Schema({
  contenido:{type: String, require:true},
  fecha:{type: Date, default:Date.now}
});

const Mensaje = mongoose.model("Mensaje",mensajeSchema);

app.use(express.static(path.join(__dirname, "public")));
app.set("port", process.env.PORT || 3000);

const sever = app.listen(app.get("port"), () => {
  console.log("server port:", app.get("port"));
});

const io = socketIO(sever);

//Rota para la pagina principal
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public/index.html"));
});

//Conexion con Socket.io
io.on('connection', (socket)=> {
  console.log("Nuevo cliente conectado");

  socket.on('message',async (data)=>{
    console.log("Datos recibidos: ",data);

 //Validamos el contenido del mensaje antes de procesarlo
 if(!data.msg || typeof data.msg !== "string" || data.msg.trim() === ""){
    console.log("El mensaje recibido esta vacio o no es valido");
    return;
 }
    //Emitir el mensaje a todos los clientes conectados
    socket.broadcast.emit("message", data.msg);
    if(data && data.msg){
      socket.broadcast.emit("message",data.msg);
      }

    //Guardar los datos en la base de datos
    try
    {
      const nuevoMensaje = new Mensaje({contenido:data.msg});
      if(!nuevoMensaje.contenido){
        throw new Error("El contenido del mensaje es invalido o esta vacio");
      }
      await nuevoMensaje.save();
      console.log("Mensajes guardado en MongoDB: ",data.msg);
    }
    catch(error)
    {
      console.log("Error al guardar los mensajes: ",error);
    }
  })
})

