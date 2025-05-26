const Motion = require("../models/motion");
const User = require("../models/user");
const Client = require("../models/client");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const sharp = require("sharp");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const mongoose = require("mongoose");

const { transporter } = require("../helper/mailer");

exports.getClients = async (request, response) => {
  try {
    const clients = await Client.find();

    if (clients) {
      response.json({
        success: true,
        clients,
      });
    }
    if (!clients) {
      console.log(error.message);
      response.status(400).end();
    }
  } catch (error) {
    console.log(error.message);
  }
};

exports.getClient = async (request, response) => {
  const { id } = request.params;

  try {
    const client = await Client.findById(id)
      .populate("appointments")
      .populate("motionId")
      .populate("userId");

    if (client) {
      response.json({
        success: true,
        client,
      });
    } else {
      response
        .status(404)
        .json({ success: false, message: "Client not found" });
    }
  } catch (error) {
    console.log("Error:", error.message);
    response.status(500).json({ success: false, message: "Server error" });
  }
};

exports.findClientByName = async (req, res) => {
  try {
    const { name, surname } = req.body; // Recibimos el nombre y apellido desde la solicitud

    // Buscar el cliente por nombre y apellido
    const client = await Client.findOne({ name, surname });

    if (!client) {
      return res
        .status(404)
        .json({ success: false, message: "Cliente no encontrado" });
    }

    // Si se encuentra, devolver el ID del cliente
    return res.status(200).json({
      success: true,
      message: "Cliente encontrado",
      clientId: client._id,
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

const orkino = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: "orkinogestion@gmail.com",
    pass: "qvoajbigbggcvycj",
  },
});

const generateVerificationCode = () => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

exports.savePasswordAndSendVerificationCode = async (req, res) => {
  const { email, password, confirmPassword } = req.body;

  try {
    if (password !== confirmPassword) {
      return res
        .status(400)
        .json({ success: false, message: "Las contraseñas no coinciden" });
    }

    const client = await Client.findOne({ email });

    if (!client) {
      return res
        .status(404)
        .json({ success: false, message: "Cliente no encontrado" });
    }
    if (client.registered) {
      return res
        .status(404)
        .json({ success: false, message: "El cliente ya está registrado" });
    }

    const salt = await bcrypt.genSalt(8);
    const hashedPassword = await bcrypt.hash(password, salt);

    const verificationCode = generateVerificationCode();
    const verificationCodeExpires = new Date(Date.now() + 10 * 60 * 1000);

    client.password = hashedPassword;
    client.registered = true;
    client.verificationCode = verificationCode;
    client.verificationCodeExpires = verificationCodeExpires;
    await client.save();

    // Crear objeto cliente sin password para la respuesta
    const clientResponse = client.toObject();
    delete clientResponse.password;

    const mailOptions = {
      from: '"Orkino" <orkinogestion@gmail.com>',
      to: email,
      subject: "Código de verificación",
      text: `Tu código de verificación es: ${verificationCode}. Este código expirará en 10 minutos.`,
    };

    orkino.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log("Error al enviar el correo:", error);
        return res.status(500).json({
          success: false,
          message: "Error al enviar el código de verificación",
        });
      }

      res.status(200).json({
        success: true,
        message: "Código de verificación enviado",
        client: clientResponse, // Enviamos el cliente sin password
      });
    });
  } catch (error) {
    console.log("Error en el controlador:", error);
    res.status(500).json({ success: false, message: "Error en el servidor" });
  }
};

exports.generateNewVerificationCode = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      message: "El email es requerido",
    });
  }

  try {
    const client = await Client.findOne({ email }).select("-password");

    if (!client) {
      return res.status(404).json({
        success: false,
        message: "Cliente no encontrado",
      });
    }

    if (client.verified) {
      return res.status(400).json({
        success: false,
        message: "La cuenta ya está verificada",
        client, // Devuelve el cliente aunque esté verificado
      });
    }

    if (
      client.verificationCode &&
      client.verificationCodeExpires > new Date()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Ya existe un código de verificación activo. Por favor, revisa tu correo electrónico.",
        client, // Devuelve el cliente actual
      });
    }

    const newVerificationCode = generateVerificationCode();
    const verificationCodeExpires = new Date(Date.now() + 10 * 60 * 1000);

    // Actualizar solo los campos necesarios
    const updatedClient = await Client.findOneAndUpdate(
      { email },
      {
        verificationCode: newVerificationCode,
        verificationCodeExpires,
        $unset: {
          verificationAttempts: 1,
        },
      },
      { new: true, select: "-password" }
    );

    const mailOptions = {
      from: '"Orkino" <orkinogestion@gmail.com>',
      to: email,
      subject: "Nuevo código de verificación",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2c3e50;">Nuevo código de verificación</h2>
          <p>Tu nuevo código de verificación es:</p>
          <div style="background: #f8f9fa; padding: 10px 15px; 
              font-size: 24px; letter-spacing: 2px; 
              display: inline-block; margin: 10px 0;">
            ${newVerificationCode}
          </div>
          <p>Este código expirará en 10 minutos.</p>
          <p style="font-size: 12px; color: #7f8c8d;">
            Si no solicitaste este código, por favor ignora este mensaje.
          </p>
        </div>
      `,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error al enviar el correo:", error);
        return res.status(500).json({
          success: false,
          message: "Error al enviar el nuevo código de verificación",
          client: updatedClient,
        });
      }

      res.status(200).json({
        success: true,
        message: "Nuevo código de verificación enviado",
        client: updatedClient,
      });
    });
  } catch (error) {
    console.error("Error en el controlador:", error);
    res.status(500).json({
      success: false,
      message: "Error en el servidor",
      error: error.message,
    });
  }
};
exports.verifyCode = async (req, res) => {
  const { email, verificationCode } = req.body;

  // Validación básica de los parámetros de entrada
  if (!email || !verificationCode) {
    return res.status(400).json({
      success: false,
      message: "Email y código de verificación son requeridos",
    });
  }

  try {
    // Buscar cliente excluyendo campos sensibles
    const client = await Client.findOne({ email }).select("-password");

    if (!client) {
      return res.status(404).json({
        success: false,
        message: "Cliente no encontrado",
      });
    }

    // Verificar si el código coincide
    if (client.verificationCode !== verificationCode) {
      return res.status(400).json({
        success: false,
        message: "Código de verificación incorrecto",
        client, // Devuelve el cliente actual para referencia
      });
    }

    // Verificar si el código ha expirado
    if (client.verificationCodeExpires < new Date()) {
      return res.status(400).json({
        success: false,
        message: "El código de verificación ha expirado",
        client, // Devuelve el cliente actual
      });
    }

    // Actualizar el cliente como verificado
    const updatedClient = await Client.findOneAndUpdate(
      { email },
      {
        $set: { verified: true },
        $unset: {
          verificationCode: 1,
          verificationCodeExpires: 1,
        },
      },
      { new: true, select: "-password" } // Devuelve el documento actualizado
    );

    // Configurar correo de confirmación
    const mailOptions = {
      from: '"Orkino" <orkinogestion@gmail.com>',
      to: email,
      subject: "Verificación exitosa",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2c3e50;">¡Verificación Exitosa!</h2>
          <p>Tu cuenta ha sido verificada correctamente.</p>
          <p>Ahora puedes acceder a todos los servicios disponibles.</p>
          <p style="font-size: 12px; color: #7f8c8d;">
            Si no reconoces esta actividad, por favor contacta con soporte.
          </p>
        </div>
      `,
    };

    // Enviar correo electrónico
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error al enviar correo de confirmación:", error);
        // Aunque falló el correo, la verificación fue exitosa
        return res.status(200).json({
          success: true,
          message:
            "Cuenta verificada, pero no se pudo enviar la confirmación por correo",
          client: updatedClient,
        });
      }

      // Respuesta exitosa completa
      res.status(200).json({
        success: true,
        message: "Cuenta verificada exitosamente",
        client: updatedClient,
      });
    });
  } catch (error) {
    console.error("Error en verifyCode:", error);
    res.status(500).json({
      success: false,
      message: "Error en el servidor",
      error: error.message,
    });
  }
};

exports.signInClient = async (request, response) => {
  try {
    const { email, password } = request.body;
    if (!email.trim() || !password.trim())
      return sendError(response, "email / password missing");

    const clients = await Client.find();

    if (!clients) {
      console.log(error.message);
      response.status(400).end();
    }

    const client = await clients.find((el) => el.email === email);

    const isMatch = await bcrypt.compare(password, client.password);

    if (!isMatch)
      return response.json({
        success: false,
        message: "password does not match",
      });

    const token = jwt.sign({ clientId: client._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });
    response.json({
      success: true,
      client: {
        id: client._id,
        // userName: client.userName,
        email: client.email,
        password: client.password,
        // avatar: client.avatar ? user.avatar : "",
        token,
        roles: client.roles,
      },
      // user: userInfo,
      // token,
    });

    if (!client) {
      console.log(error.message);
      response.status(400).end();
    }
  } catch (error) {
    console.log(error.message);
    response.status(400).end();
  }
};

exports.createClient = async (request, response) => {
  try {
    const {
      email,
      name,
      surname,
      cellPhone,
      password,
      resetPasswordToken,
      resetPasswordExpires,
      verificationCode,
      verificationCodeExpires,
      avatar,
      appointments,
      sessionsHistory,
      personalData,
      personalHistory,
      familyHistory,
      birthDate,
      size,
      gender,
      userId,
      adminId,
      roles,
      data,
      cMJValidateNumbers,
    } = request.body;

    const existingClient = await Client.findOne({ email });
    if (existingClient) {
      return response
        .status(400)
        .json({ success: false, message: "El email ya está registrado" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return response
        .status(404)
        .json({ success: false, message: "Usuario no encontrado" });
    }

    const newClient = new Client({
      email,
      name,
      surname,
      cellPhone,
      password,
      resetPasswordToken,
      resetPasswordExpires,
      verificationCode,
      verificationCodeExpires,
      avatar,
      appointments,
      sessionsHistory,
      personalData,
      personalHistory,
      familyHistory,
      birthDate,
      size,
      gender,
      roles,
      data,
      cMJValidateNumbers,
      userId,
      adminId,
    });

    const savedClient = await newClient.save();
    user.clientId = user.clientId.concat(savedClient._id);
    await user.save();

    response.json({ success: true, savedClient });
  } catch (error) {
    console.error("Error creando cliente:", error);
    response.status(500).json({ success: false, message: error.message });
  }
};

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const client = await Client.findOne({ email });

    if (!client) {
      return res.status(200).json({
        message:
          "Si el correo existe, te enviaremos un enlace de recuperación.",
      });
    }

    const resetToken = crypto.randomBytes(20).toString("hex");

    const resetTokenExpires = new Date(Date.now() + 3600000); // 1 hora

    client.resetPasswordToken = resetToken;
    client.resetPasswordExpires = resetTokenExpires;
    await client.save();

    const resetUrl = `http://localhost:5173/reset-password?token=${resetToken}`;

    const mailOptions = {
      from: '"Orkino" <orkinogestion@gmail.com>',
      to: email,
      subject: "Recuperación de contraseña",
      text: `Para restablecer tu contraseña, haz clic en el siguiente enlace: ${resetUrl}\n\nEste enlace expirará en 1 hora.`, // Cuerpo del correo
    };

    orkino.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log("Error al enviar el correo:", error);
        return res.status(500).json({
          success: false,
          message: "Error al enviar el correo de recuperación",
        });
      }
      console.log("Correo enviado:", info.response);
      res.status(200).json({
        success: true,
        message:
          "Si el correo existe, te enviaremos un enlace de recuperación.",
      });
    });
  } catch (error) {
    console.log("Error en el controlador:", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
};

exports.authenticateClient = async (req, res) => {
  const { email, password } = req.body;

  try {
    const client = await Client.findOne({ email });

    if (!client) {
      return res
        .status(404)
        .json({ success: false, message: "Cliente no encontrado" });
    }

    const isPasswordValid = await bcrypt.compare(password, client.password);

    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ success: false, message: "Credenciales incorrectas" });
    }

    const token = jwt.sign(
      { id: client._id, email: client.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({ success: true, token, client });
  } catch (error) {
    console.error("Error autenticando cliente:", error);
    res.status(500).json({ success: false, message: "Error en el servidor" });
  }
};

exports.resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    // Buscar al cliente por el token y verificar que no haya expirado
    const client = await Client.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() }, // Verificar que el token no haya expirado
    });

    if (!client) {
      return res
        .status(400)
        .json({ message: "El token es inválido o ha expirado." });
    }

    // Encriptar la nueva contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    client.password = hashedPassword;
    client.resetPasswordToken = undefined;
    client.resetPasswordExpires = undefined;
    await client.save();

    // Enviar un correo de confirmación
    const mailOptions = {
      from: '"Orkino" <orkinogestion@gmail.com>', // Remitente
      to: client.email, // Destinatario
      subject: "Contraseña restablecida", // Asunto
      text: `Tu contraseña ha sido restablecida exitosamente.`, // Cuerpo del correo
    };

    orkino.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log("Error al enviar el correo:", error);
      }
      console.log("Correo enviado:", info.response);
    });

    res.status(200).json({
      success: true,
      message: "Contraseña restablecida exitosamente.",
    });
  } catch (error) {
    console.log("Error en el controlador:", error);
    res.status(500).json({ success: false, message: "Error en el servidor" });
  }
};

exports.deleteClient = async (req, res) => {
  try {
    const response = await Client.findByIdAndDelete(req.params.id);
    res.json({ success: true, response });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
};

exports.updateClient = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (updateData.personalData) {
      updateData.$set = { personalData: updateData.personalData };
      delete updateData.personalData;
    }

    const updatedClient = await Client.findByIdAndUpdate(id, updateData, {
      new: true,
      upsert: true, // Crea el documento si no existe
    });

    res.json({ updatedClient });
  } catch (error) {
    console.error("Error updating client:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
exports.updateClientPersonalHistory = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { personalHistory: req.body };

    const updatedClient = await Client.findByIdAndUpdate(
      id,
      { $set: updateData },
      {
        new: true,
        upsert: true,
      }
    );

    res.json({ updatedClient });
  } catch (error) {
    console.error("Error updating client:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.updateClientFamilyHistory = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { familyHistory: req.body };

    const updatedClient = await Client.findByIdAndUpdate(
      id,
      { $set: updateData },
      {
        new: true,
        upsert: true,
      }
    );

    res.json({ updatedClient });
  } catch (error) {
    console.error("Error updating family history:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.updateClientDiagnostics = async (req, res) => {
  try {
    const { id } = req.params;
    const { sessionNumber, diagnosis } = req.body;

    const client = await Client.findById(id);

    if (!client) {
      return res.status(404).json({ error: "Cliente no encontrado" });
    }

    const activeSessionIndex = client.sessionsHistory.findIndex(
      (session) => session.active === true
    );

    if (activeSessionIndex === -1) {
      return res
        .status(400)
        .json({ error: "No hay una sesión activa para este cliente" });
    }

    const activeSession = client.sessionsHistory[activeSessionIndex];

    if (activeSession.number !== sessionNumber) {
      return res.status(400).json({
        error: "El número de sesión no coincide con la sesión activa",
      });
    }

    // Asegurarse de que activeSession.diagnosis esté inicializado como un array
    if (!activeSession.diagnosis) {
      activeSession.diagnosis = [];
    }

    // Concatenar los nuevos diagnósticos con los existentes
    activeSession.diagnosis = activeSession.diagnosis.concat(diagnosis);

    const updatedClient = await Client.findByIdAndUpdate(
      id,
      { $set: { [`sessionsHistory.${activeSessionIndex}`]: activeSession } },
      { new: true }
    );

    res.json({ updatedClient });
  } catch (error) {
    console.error(
      "Error al actualizar el diagnóstico:",
      error.message,
      error.stack
    );
    res.status(500).json({ error: "Error al actualizar el diagnóstico" });
  }
};

exports.updateClientDiagnosticsGoals = async (req, res) => {
  try {
    const { id } = req.params;
    const { sessionNumber, diagnosisTimestamp, goalId, updatedGoal } = req.body;

    const client = await Client.findById(id);
    if (!client) {
      return res.status(404).json({ error: "Cliente no encontrado" });
    }

    const activeSessionIndex = client.sessionsHistory.findIndex(
      (session) => session.active === true
    );

    if (activeSessionIndex === -1) {
      return res
        .status(400)
        .json({ error: "No hay una sesión activa para este cliente" });
    }

    const activeSession = client.sessionsHistory[activeSessionIndex];

    if (activeSession.number !== sessionNumber) {
      return res.status(400).json({
        error: "El número de sesión no coincide con la sesión activa",
      });
    }

    const diagnosisIndex = activeSession.diagnosis.findIndex(
      (diag) => diag.timestamp === diagnosisTimestamp
    );

    if (diagnosisIndex === -1) {
      return res.status(404).json({ error: "Diagnóstico no encontrado" });
    }

    if (goalId) {
      // Actualizar un objetivo existente
      const goalIndex = activeSession.diagnosis[diagnosisIndex].goals.findIndex(
        (goal) => goal.id === goalId
      );

      if (goalIndex === -1) {
        return res.status(404).json({ error: "Objetivo no encontrado" });
      }

      activeSession.diagnosis[diagnosisIndex].goals[goalIndex] = updatedGoal;
    } else {
      // Agregar un nuevo objetivo
      if (!activeSession.diagnosis[diagnosisIndex].goals) {
        activeSession.diagnosis[diagnosisIndex].goals = [];
      }
      activeSession.diagnosis[diagnosisIndex].goals.push(updatedGoal);
    }

    const updatedClient = await Client.findByIdAndUpdate(
      id,
      { $set: { [`sessionsHistory.${activeSessionIndex}`]: activeSession } },
      { new: true }
    );

    res.json({ updatedClient });
  } catch (error) {
    console.error(
      "Error al actualizar los objetivos:",
      error.message,
      error.stack
    );
    res.status(500).json({ error: "Error al actualizar los objetivos" });
  }
};
exports.updateClientCurrentCondition = async (req, res) => {
  try {
    const { id } = req.params;
    const { sessionNumber, currentCondition } = req.body;

    // Buscar al cliente por ID
    const client = await Client.findById(id);

    if (!client) {
      return res.status(404).json({ error: "Cliente no encontrado" });
    }

    const activeSessionIndex = client.sessionsHistory.findIndex(
      (session) => session.active === true
    );

    if (activeSessionIndex === -1) {
      return res
        .status(400)
        .json({ error: "No hay una sesión activa para este cliente" });
    }

    const activeSession = client.sessionsHistory[activeSessionIndex];

    if (activeSession.number !== sessionNumber) {
      return res.status(400).json({
        error: "El número de sesión no coincide con la sesión activa",
      });
    }

    // Asignar o actualizar la condición actual en la sesión activa
    activeSession.currentCondition = currentCondition;

    // Actualizar el cliente con la nueva condición actual
    const updatedClient = await Client.findByIdAndUpdate(
      id,
      { $set: { [`sessionsHistory.${activeSessionIndex}`]: activeSession } },
      { new: true }
    );

    res.json({ updatedClient });
  } catch (error) {
    console.error(
      "Error al actualizar la condición actual:",
      error.message,
      error.stack
    );
    res.status(500).json({ error: "Error al actualizar la condición actual" });
  }
};
exports.updateClientLifeStyle = async (req, res) => {
  try {
    const { id } = req.params;
    const { sessionNumber, lifeStyleData } = req.body;

    // Buscar al cliente por ID
    const client = await Client.findById(id);

    if (!client) {
      return res.status(404).json({ error: "Cliente no encontrado" });
    }

    // Buscar la sesión activa del cliente
    const activeSessionIndex = client.sessionsHistory.findIndex(
      (session) => session.active === true
    );

    if (activeSessionIndex === -1) {
      return res
        .status(400)
        .json({ error: "No hay una sesión activa para este cliente" });
    }

    const activeSession = client.sessionsHistory[activeSessionIndex];

    if (activeSession.number !== sessionNumber) {
      return res.status(400).json({
        error: "El número de sesión no coincide con la sesión activa",
      });
    }

    // Asignar o actualizar los datos de estilo de vida en la sesión activa
    activeSession.lifeStyle = lifeStyleData;

    // Guardar cambios en la base de datos
    const updatedClient = await Client.findByIdAndUpdate(
      id,
      { $set: { [`sessionsHistory.${activeSessionIndex}`]: activeSession } },
      { new: true }
    );

    res.json({ updatedClient });
  } catch (error) {
    console.error(
      "Error al actualizar el estilo de vida:",
      error.message,
      error.stack
    );
    res.status(500).json({ error: "Error al actualizar el estilo de vida" });
  }
};

exports.addTreatmentToClient = async (req, res) => {
  try {
    const { id } = req.params;
    const { treatment } = req.body;
    console.log("el tratameinto", treatment);

    const client = await Client.findById(id);

    if (!client) {
      return res.status(404).json({ error: "Cliente no encontrado" });
    }

    const activeSession = client.sessionsHistory.find(
      (session) => session.active === true
    );
    const activeSessionIndex = client.sessionsHistory.findIndex(
      (session) => session.active === true
    );

    if (!activeSession) {
      return res
        .status(400)
        .json({ error: "No hay una sesión activa para este cliente" });
    }

    if (!Array.isArray(activeSession.sessions)) {
      activeSession.sessions = [];
    }

    activeSession.sessions.push({
      number: activeSession.sessions.length + 1,
      date: treatment.date,
      hour: treatment.hour,
      done: false,
      inPerson: true,
      dailyReview: {},
      routine: treatment.routine,
    });

    const updatedClient = await Client.findByIdAndUpdate(
      id,
      {
        $set: {
          sessionsHistory: client.sessionsHistory,
        },
      },
      { new: true }
    );

    res.json(updatedClient);
  } catch (error) {
    console.error("Error al agregar la sesión:", error.message, error.stack);
    res.status(500).json({ error: "Error al agregar la sesión" });
  }
};
exports.deleteTreatmentFromClient = async (req, res) => {
  try {
    const { id } = req.params;
    const { date } = req.body;

    const client = await Client.findById(id);

    if (!client) {
      return res.status(404).json({ error: "Cliente no encontrado" });
    }

    const activeSession = client.sessionsHistory.find(
      (session) => session.active === true
    );

    if (!activeSession) {
      return res
        .status(400)
        .json({ error: "No hay una sesión activa para este cliente" });
    }

    activeSession.sessions = activeSession.sessions.filter(
      (session) => session.date !== date
    );

    // Guarda los cambios en la base de datos
    const updatedClient = await Client.findByIdAndUpdate(
      id,
      {
        $set: {
          sessionsHistory: client.sessionsHistory,
        },
      },
      { new: true }
    );

    res.json(updatedClient);
  } catch (error) {
    console.error("Error al eliminar la sesión:", error.message, error.stack);
    res.status(500).json({ error: "Error al eliminar la sesión" });
  }
};

exports.updateSession = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, routine } = req.body;

    const client = await Client.findById(id);
    if (!client) {
      return res.status(404).json({ error: "Cliente no encontrado" });
    }

    const activeSession = client.sessionsHistory.find(
      (session) => session.active === true
    );
    if (!activeSession) {
      return res.status(400).json({ error: "No hay una sesión activa" });
    }

    const sessionToUpdate = activeSession.sessions.find(
      (session) => session.date === date
    );
    if (!sessionToUpdate) {
      return res.status(404).json({ error: "Sesión no encontrada" });
    }

    sessionToUpdate.routine = routine;

    const updatedClient = await Client.findByIdAndUpdate(
      id,
      { $set: { sessionsHistory: client.sessionsHistory } },
      { new: true }
    );

    res.json(updatedClient);
  } catch (error) {
    console.error("Error updating session:", error.message);
    res.status(500).json({ error: "Error updating session" });
  }
};

exports.addNewTreatmentToClient = async (req, res) => {
  try {
    const { id } = req.params; // ID del cliente
    const { treatment } = req.body; // Nueva sesión

    // Encuentra al cliente y agrega la nueva sesión
    const updatedClient = await Client.findByIdAndUpdate(
      id,
      { $push: { sessionsHistory: treatment } }, // Ajusta el nivel según tu esquema
      { new: true } // Retorna el cliente actualizado
    );

    res.json(updatedClient); // Retorna el cliente actualizado
  } catch (error) {
    console.error("Servidor:Error al agregar la sesión:", error);
    res.status(500).json({ error: "Servidor:Error al agregar la sesión" });
  }
};
exports.deactivateTreatmentForClient = async (req, res) => {
  try {
    const { id } = req.params; // ID del cliente
    const { treatmentNumber } = req.body; // Número del tratamiento a desactivar

    // Encuentra el cliente y actualiza el tratamiento activo
    const updatedClient = await Client.findOneAndUpdate(
      { _id: id, "sessionsHistory.number": treatmentNumber },
      {
        $set: {
          "sessionsHistory.$.active": false,
          "sessionsHistory.$.end": new Date().toLocaleDateString(),
        },
      },
      { new: true }
    );

    if (!updatedClient) {
      return res
        .status(404)
        .json({ error: "Cliente o tratamiento no encontrado" });
    }

    res.json(updatedClient); // Retorna el cliente actualizado
  } catch (error) {
    console.error("Servidor: Error al desactivar el tratamiento:", error);
    res
      .status(500)
      .json({ error: "Servidor: Error al desactivar el tratamiento" });
  }
};

exports.addDailyReview = async (req, res) => {
  const { id } = req.params; // ID del cliente
  const { dailyReview } = req.body; // Nuevo dailyReview a agregar

  try {
    const client = await Client.findById(id);
    if (!client) {
      return res.status(404).json({ message: "Cliente no encontrado." });
    }
    const lastSessionIndex = client.sessionsHistory.findIndex(
      (session) => session.active
    );
    if (lastSessionIndex === -1) {
      return res.status(400).json({ message: "No hay una sesión activa." });
    }
    const sessionPath = `sessionsHistory.${lastSessionIndex}.dailyReview`;
    const updatedClient = await Client.findByIdAndUpdate(
      id,
      { $push: { [sessionPath]: dailyReview } },
      { new: true }
    );
    return res.status(200).json(updatedClient);
  } catch (error) {
    console.error("Error al agregar dailyReview:", error);
    return res.status(500).json({ message: "Error del servidor." });
  }
};

// sesiones asincronas
exports.addAsynchronousSession = async (req, res) => {
  try {
    const { id } = req.params;
    const { sessionData } = req.body;

    if (!sessionData || typeof sessionData !== "object") {
      return res.status(400).json({
        success: false,
        error: "Datos de sesión inválidos",
      });
    }

    if (!sessionData.date || !sessionData.routine) {
      return res.status(400).json({
        success: false,
        error: "Fecha y ejercicios son requeridos",
      });
    }

    const updatedClient = await Client.findByIdAndUpdate(
      id,
      {
        $push: {
          "sessionsHistory.$[treatment].asynchronousSession": {
            ...sessionData,
            _id: new mongoose.Types.ObjectId(),
          },
        },
      },
      {
        new: true,
        arrayFilters: [{ "treatment.active": true }],
        runValidators: true,
      }
    ).lean();

    if (!updatedClient) {
      return res.status(404).json({
        success: false,
        error: "Cliente no encontrado",
      });
    }

    res.json({
      success: true,
      updatedClient,
    });
  } catch (error) {
    console.error("Error al agregar sesión asíncrona:", error);
    res.status(500).json({
      success: false,
      error: "Error interno del servidor",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
exports.getAllAsyncSessions = async (req, res) => {
  try {
    const { id } = req.params;

    const client = await Client.findById(id).lean();

    if (!client) {
      return res.status(404).json({
        success: false,
        error: "Cliente no encontrado",
      });
    }

    // Encontrar el tratamiento activo
    const activeTreatment = client.sessionsHistory.find(
      (t) => t.active === true
    );

    if (!activeTreatment || !activeTreatment.asynchronousSession) {
      return res.json({
        success: true,
        sessions: [],
      });
    }

    res.json({
      success: true,
      sessions: activeTreatment.asynchronousSession,
    });
  } catch (error) {
    console.error("Error al obtener sesiones asíncronas:", error);
    res.status(500).json({
      success: false,
      error: "Error interno del servidor",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

exports.getSingleAsyncSession = async (req, res) => {
  try {
    const { id, sessionId } = req.params;

    const client = await Client.findOne(
      {
        _id: id,
        "sessionsHistory.asynchronousSession._id": sessionId,
      },
      {
        "sessionsHistory.$": 1,
      }
    ).lean();

    if (!client) {
      return res.status(404).json({
        success: false,
        error: "Cliente o sesión no encontrada",
      });
    }

    const activeTreatment = client.sessionsHistory.find(
      (t) => t.active === true
    );
    const session = activeTreatment.asynchronousSession.find(
      (s) => s._id.toString() === sessionId
    );

    if (!session) {
      return res.status(404).json({
        success: false,
        error: "Sesión no encontrada",
      });
    }

    res.json({
      success: true,
      session,
    });
  } catch (error) {
    console.error("Error al obtener sesión asíncrona:", error);
    res.status(500).json({
      success: false,
      error: "Error interno del servidor",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
// Controlador actualizado para updateAsyncSession
exports.updateAsyncSession = async (req, res) => {
  try {
    const { id, sessionId } = req.params;
    const { sessionData } = req.body;

    if (
      !mongoose.Types.ObjectId.isValid(id) ||
      !mongoose.Types.ObjectId.isValid(sessionId)
    ) {
      return res.status(400).json({
        success: false,
        error: "ID inválido",
      });
    }

    if (!sessionData || typeof sessionData !== "object") {
      return res.status(400).json({
        success: false,
        error: "Datos de sesión inválidos",
      });
    }

    const updatedClient = await Client.findOneAndUpdate(
      {
        _id: id,
        "sessionsHistory.treatments.asynchronousSession._id": sessionId,
      },
      {
        $set: {
          "sessionsHistory.$[treatment].asynchronousSession.$[session]": {
            ...sessionData,
            _id: sessionId,
          },
        },
      },
      {
        new: true,
        arrayFilters: [
          { "treatment.active": true },
          { "session._id": new mongoose.Types.ObjectId(sessionId) },
        ],
        runValidators: true,
      }
    ).lean();

    if (!updatedClient) {
      return res.status(404).json({
        success: false,
        error: "Cliente o sesión no encontrada",
      });
    }

    res.json({
      success: true,
      updatedClient,
    });
  } catch (error) {
    console.error("Error al editar sesión asíncrona:", error);
    res.status(500).json({
      success: false,
      error: "Error interno del servidor",
    });
  }
};
exports.deleteAsyncSession = async (req, res) => {
  try {
    const { id, sessionId } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(id) ||
      !mongoose.Types.ObjectId.isValid(sessionId)
    ) {
      return res.status(400).json({
        success: false,
        error: "ID inválido",
      });
    }

    const updatedClient = await Client.findByIdAndUpdate(
      id,
      {
        $pull: {
          "sessionsHistory.$[treatment].asynchronousSession": {
            _id: new mongoose.Types.ObjectId(sessionId),
          },
        },
      },
      {
        new: true,
        arrayFilters: [{ "treatment.active": true }],
      }
    ).lean();

    if (!updatedClient) {
      return res.status(404).json({
        success: false,
        error: "Cliente o sesión no encontrada",
      });
    }

    res.json({
      success: true,
      updatedClient,
    });
  } catch (error) {
    console.error("Error al eliminar sesión asíncrona:", error);
    res.status(500).json({
      success: false,
      error: "Error interno del servidor",
    });
  }
};
