const nodemailer = require("nodemailer");
require("dotenv").config();

const sendEmail = async (req, res) => {
  const { name, email, message } = req.body;

  // Validación básica
  if (!name || !email || !message) {
    return res.status(400).json({
      success: false,
      message: "Todos los campos son requeridos",
    });
  }

  // Configuración del transporter (para Gmail)
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // Opciones del email
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.EMAIL_RECEIVER || "ferbassino@gmail.com", // Email destino
    replyTo: email,
    subject: `Nuevo mensaje de ${name} desde tu portfolio`,
    html: `
      <h2>Nuevo mensaje de contacto</h2>
      <p><strong>Nombre:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Mensaje:</strong></p>
      <p>${message.replace(/\n/g, "<br>")}</p>
      <hr>
      <p>Enviado desde el portfolio de ${name}</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({
      success: true,
      message: "Mensaje enviado con éxito",
    });
  } catch (error) {
    console.error("Error al enviar el email:", error);
    res.status(500).json({
      success: false,
      message: "Error al enviar el mensaje",
      error: error.message,
    });
  }
};

module.exports = { sendEmail };
