const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

// Configurar socket.io con el servidor HTTP y permitir CORS
const io = new Server(server, {
  cors: {
    origin: "*", // Permitir que cualquier origen se conecte (ajusta esto si necesitas seguridad más estricta)
  },
});

// Manejar nuevas conexiones
io.on("connection", (socket) => {
  console.log("Cliente conectado");

  // Escuchar los datos del cliente
  socket.on("sensorData", (data) => {
    console.log("Datos recibidos del sensor:", data);

    // Emitir los datos a todos los clientes conectados, incluido el emisor
    io.emit("sensorData", data); // Esto enviará los datos a todos los clientes conectados
  });

  // Manejar desconexiones
  socket.on("disconnect", () => {
    console.log("Cliente desconectado");
  });
});

// Iniciar el servidor
server.listen(3001, () => {
  console.log("Servidor escuchando en el puerto 3000");
});
