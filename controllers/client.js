const Motion = require("../models/motion");
const User = require("../models/user");
const Client = require("../models/client");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const sharp = require("sharp");
const nodemailer = require("nodemailer");

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
  console.log("id en getClient:", id);

  try {
    const client = await Client.findById(id)
      .populate("appointments")
      .populate("motion")
      .populate("user");

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

// controllers/clientController.js

exports.findClientByName = async (req, res) => {
  try {
    console.log("requ.body", req.body);

    const { name, surname } = req.body; // Recibimos el nombre y apellido desde la solicitud
    console.log(
      "lo que llega al backend -----------------------",
      name,
      surname
    );

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

    // Asegurar que personalData se actualiza correctamente
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
    console.log(id, sessionNumber, lifeStyleData);

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
      dailyReview: {},
      warmUp: treatment.warmUp,
      workOut: treatment.workOut,
      coolDown: treatment.coolDown,
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
    const { date, warmUp, workOut, coolDown } = req.body;
    console.log(id, date, warmUp, workOut, coolDown);

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

    sessionToUpdate.warmUp = warmUp;
    sessionToUpdate.workOut = workOut;
    sessionToUpdate.coolDown = coolDown;

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
  console.log("entra por aca");

  try {
    const { id } = req.params; // ID del cliente
    const { treatment } = req.body; // Nueva sesión
    console.log("clientId", id);
    console.log("treatment", treatment);

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
  console.log("Solicitud para desactivar tratamiento recibida.");

  try {
    const { id } = req.params; // ID del cliente
    const { treatmentNumber } = req.body; // Número del tratamiento a desactivar

    console.log("Cliente ID:", id);
    console.log("Tratamiento a desactivar:", treatmentNumber);

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
  console.log(id, dailyReview);

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
