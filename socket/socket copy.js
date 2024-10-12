// socket.js
const { Server } = require("socket.io");

const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "*", // Permitir todos los dominios en desarrollo
      methods: ["GET", "POST"],
    },
    // path: "/my-custom-socket-path",
  });

  // Usar un namespace para que el socket solo se conecte en una ruta específica
  const customNamespace = io.of("/custom-socket");

  // Manejar conexiones de Socket.IO en el namespace
  customNamespace.on("connection", (socket) => {
    console.log("Cliente conectado al namespace custom-socket:", socket.id);

    // Escuchar eventos personalizados
    socket.on("sensorData", (data) => {
      //   console.log("Datos recibidos del cliente:", data);
      // Emitir los datos recibidos a todos los clientes conectados
      customNamespace.emit("sensorData", data);
    });

    socket.on("disconnect", () => {
      console.log(
        "Cliente desconectado del namespace custom-socket:",
        socket.id
      );
    });
  });

  return io;
};

module.exports = initializeSocket;
