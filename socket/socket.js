const { Server } = require("socket.io");

const initializeSocket = (server) => {
  // const io = new Server(server, {
  //   cors: {
  //     origin: "*",
  //     methods: ["GET", "POST"],
  //   },
  // });
  const io = new Server(server, {
    wssEngine: ["ws", "wss"],
    transports: ["websocket", "polling"],
    cors: {
      origin: "*", // Permitir todos los dominios en desarrollo
    },
    allowEIO3: true,
  });
  io.engine.on("connection_error", (err) => {
    console.log(err.req); // the request object
    console.log(err.code); // the error code, for example 1
    console.log(err.message); // the error message, for example "Session ID unknown"
    console.log(err.context); // some additional error context
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
