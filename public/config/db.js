
const { MongoClient } = require('mongodb');
const uri = "mongodb://localhost:27017"; // Reemplaza con tu cadena de conexión
const client = new MongoClient(uri);

async function initDB() {
  try {
    await client.connect();
    console.log("Conectado a MongoDB");
    const database = client.db('chat-real'); // Reemplaza con el nombre de tu base de datos
    const collection = database.collection('messages'); // Reemplaza con el nombre de tu colección
    return collection;
  } catch (error) {
    console.error(error);
  }
}

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public/index.html"));
});

io.on("connection", (socket) => {
  socket.on("message", async (data) => {
    const collection = await initDB(); // Obtén la colección para hacer la inserción
    try {
      await collection.insertOne(data); // Inserta el documento en la colección
      console.log("Datos insertados:", data);
      socket.broadcast.emit("message", data);
    } catch (error) {
      console.error("Error al insertar datos:", error);
    }
  });
});cl