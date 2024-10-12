const { Server } = require("socket.io");

const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "*", // Permitir todos los dominios en desarrollo
      methods: ["GET", "POST"],
    },
  });

  // Usar un namespace para que el socket solo se conecte en una ruta específica
  const customNamespace = io.of("/custom-socket");

  customNamespace.on("connection", (socket) => {
    console.log("Cliente conectado al namespace custom-socket:", socket.id);

    socket.on("sensorData", (data) => {
      console.log("Datos recibidos del cliente:", data);
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
