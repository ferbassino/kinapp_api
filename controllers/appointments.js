const Appointment = require("../models/appointments");
const Client = require("../models/client");

// Obtener todos los turnos
exports.getAllAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find().populate("clientId");
    res.status(200).json(appointments);
  } catch (error) {
    console.error("Error al obtener los turnos:", error);
    res.status(500).json({ message: "Error del servidor." });
  }
};

// Obtener un turno por ID
exports.getAppointment = async (req, res) => {
  const { id } = req.params;
  try {
    const appointment = await Appointment.findById(id).populate("clientId");
    if (!appointment) {
      return res.status(404).json({ message: "Turno no encontrado." });
    }
    res.status(200).json(appointment);
  } catch (error) {
    console.error("Error al obtener el turno:", error);
    res.status(500).json({ message: "Error del servidor." });
  }
};

// appointments.controller.js
exports.createAppointment = async (req, res) => {
  try {
    const { clientId } = req.params;
    const {
      date,
      time,
      status,
      paid,
      payment,
      remainsToPay,
      serviceType,
      location,
      notes,
      sessionId,
      userId,
      adminId,
    } = req.body;

    const newAppointment = await Appointment.create({
      date,
      time,
      status,
      paid,
      payment,
      remainsToPay,
      serviceType,
      location,
      notes,
      clientId,
      ...(sessionId && { sessionId }),
      ...(userId && { userId }),
      ...(adminId && { adminId }),
    });

    const updatedClient = await Client.findByIdAndUpdate(
      clientId,
      { $push: { appointments: newAppointment._id } },
      { new: true }
    );

    res.status(201).json({
      message: "Turno creado exitosamente",
      appointment: newAppointment,
      client: updatedClient,
    });
  } catch (error) {
    console.error("Error al crear el turno:", error);
    res.status(500).json({ message: "Error al crear el turno" });
  }
};

exports.updateAppointment = async (req, res) => {
  const { id } = req.params;
  const {
    date,
    time,
    status,
    paid,
    payment,
    remainsToPay,
    serviceType,
    notes,
    location,
  } = req.body;
  console.log(
    "en el update ",
    date,
    time,
    status,
    paid,
    payment,
    remainsToPay,
    serviceType,
    notes,
    location
  );

  try {
    const updatedAppointment = await Appointment.findByIdAndUpdate(
      id,
      {
        date,
        time,
        status,
        paid,
        payment,
        remainsToPay,
        serviceType,
        notes,
        location,
      },
      { new: true }
    );
    if (!updatedAppointment) {
      return res.status(404).json({ message: "Turno no encontrado." });
    }
    res.status(200).json(updatedAppointment);
  } catch (error) {
    console.error("Error al actualizar el turno:", error);
    res.status(500).json({ message: "Error del servidor." });
  }
};

exports.deleteAppointment = async (req, res) => {
  const { id } = req.params;

  try {
    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({ message: "Turno no encontrado." });
    }

    const clientId = appointment.clientId;

    await Appointment.findByIdAndDelete(id);

    await Client.findByIdAndUpdate(clientId, { $pull: { appointments: id } });

    const updatedAppointments = await Appointment.find({ clientId });

    res.status(200).json({
      message: "Turno eliminado exitosamente.",
      appointments: updatedAppointments,
    });
  } catch (error) {
    console.error("Error al eliminar el turno:", error);
    res.status(500).json({ message: "Error del servidor." });
  }
};
