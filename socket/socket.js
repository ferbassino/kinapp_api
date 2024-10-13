const Pusher = require("pusher");

const pusher = new Pusher({
  appId: "1879458",
  key: "bc602f832f2027c631c0",
  secret: "d6ac30677cce08613479",
  cluster: "sa1",
  useTLS: true,
});

const initializeSocket = (server) => {
  const customNamespace = "/custom-socket";

  server.on("request", (req, res) => {
    // Manejo de las cabeceras CORS
    res.setHeader("Access-Control-Allow-Origin", "*"); // Permitir todas las solicitudes
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
      res.writeHead(204);
      res.end();
      return;
    }

    if (req.url.startsWith(customNamespace)) {
      let body = "";
      req.on("data", (chunk) => {
        body += chunk;
      });
      req.on("end", () => {
        try {
          const parsedData = JSON.parse(body);
          console.log("Datos recibidos del cliente:", parsedData);
          // Emitir los datos recibidos a todos los clientes conectados
          pusher.trigger(
            "sensor-channel",
            "sensor-event",
            parsedData,
            (error) => {
              if (error) {
                console.error("Error al enviar datos a Pusher:", error);
              }
            }
          );
          res.writeHead(200, { "Content-Type": "text/plain" });
          res.end("Datos recibidos");
        } catch (error) {
          console.error("Error al procesar los datos recibidos:", error);
          res.writeHead(400, { "Content-Type": "text/plain" });
          res.end("Datos inválidos");
        }
      });
    }
  });

  return server;
};

module.exports = initializeSocket;
