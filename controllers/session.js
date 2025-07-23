const Session = require("../models/session");
const mongoose = require("mongoose");
const Appointment = require("../models/appointments");

exports.createSession = async (req, res) => {
  const session = await mongoose.startSession();
  // session.startTransaction();

  try {
    const { appointmentId, clientId, userId, routine = [] } = req.body;
    console.log(appointmentId, clientId, userId, routine);
    console.log("1");

    // 1. Validaciones básicas
    if (!appointmentId || !clientId || !userId) {
      throw new Error(
        "Faltan campos requeridos: appointmentId, clientId o userId"
      );
    }
    console.log("2");

    // 2. Verificar que la cita existe y está disponible
    const appointment = await Appointment.findById(appointmentId).session(
      session
    );
    console.log("3");
    if (!appointment) {
      throw new Error("La cita especificada no existe");
    }
    console.log("4");
    if (appointment.status === "completed") {
      throw new Error("No se puede crear sesión para una cita completada");
    }
    console.log("5");

    // 3. Validar estructura de la rutina
    if (!Array.isArray(routine)) {
      throw new Error("La rutina debe ser un array");
    }
    console.log("6");

    // 4. Crear la sesión con datos procesados
    const sessionData = {
      appointmentId,
      clientId,
      userId,
      // adminId: req.user._id,
      routine: routine.map((block) => ({
        ...block,
        exercises: block.exercises.map((ex) => ({
          ...ex,
          sets: ex.sets.map((set) => ({
            ...set,
            completed: false, // Fuerza estado inicial
          })),
        })),
      })),
    };
    console.log("7");

    const newSession = new Session(sessionData);
    console.log("8");
    const savedSession = await newSession.save({ session });
    console.log("9");

    // 5. Actualizar estado de la cita
    await Appointment.findByIdAndUpdate(
      appointmentId,
      { $set: { hasSession: true } },
      { session }
    );
    console.log("10");

    await session.commitTransaction();
    console.log("11");

    res.status(201).json({
      success: true,
      data: savedSession,
      message: "Sesión creada exitosamente",
    });
    console.log("12");
  } catch (error) {
    await session.abortTransaction();

    console.error("Error al crear sesión:", error.message);

    res
      .status(error instanceof mongoose.Error.ValidationError ? 400 : 500)
      .json({
        success: false,
        message: error.message,
        details:
          process.env.NODE_ENV === "development" ? error.stack : undefined,
      });
  } finally {
    session.endSession();
  }
};

// Obtener todas las sesiones
exports.getAllSessions = async (req, res) => {
  try {
    // 1. Construir query con filtros opcionales
    const {
      clientId,
      userId,
      dateFrom,
      dateTo,
      page = 1,
      limit = 10,
    } = req.query;

    const query = {};
    if (clientId) query.clientId = clientId;
    if (userId) query.userId = userId;
    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
      if (dateTo) query.createdAt.$lte = new Date(dateTo);
    }

    // 2. Consulta con paginación
    const [sessions, total] = await Promise.all([
      Session.find(query)
        .populate("clientId", "name email")
        .populate("userId", "name email")
        .populate("adminId", "name email")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit)),

      Session.countDocuments(query),
    ]);

    // 3. Calcular metadatos de paginación
    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      data: sessions,
      pagination: {
        total,
        totalPages,
        currentPage: parseInt(page),
        itemsPerPage: parseInt(limit),
      },
    });
  } catch (error) {
    console.error("Error al obtener sesiones:", error.message);
    res.status(500).json({
      success: false,
      message: "Error al obtener las sesiones",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

exports.getSessionsByClientId = async (req, res) => {
  try {
    const { clientId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(clientId)) {
      return res.status(400).json({
        success: false,
        message: "ID de cliente no válido",
      });
    }

    // Construir query
    const query = { clientId: new mongoose.Types.ObjectId(clientId) };

    // Consulta con paginación y populate
    const [sessions, total] = await Promise.all([
      Session.find(query)
        .populate("appointmentId", "date status")
        .populate("userId", "name email")
        .populate("adminId", "name email")
        .sort({ createdAt: -1 })
        .lean(), // Convertir a objetos planos para manipulación

      Session.countDocuments(query),
    ]);

    // Formatear datos de respuesta
    const formattedSessions = sessions.map((session) => ({
      ...session,
      routine: session.routine.map((block) => ({
        ...block,
        exercisesCount: block.exercises.length,
      })),
    }));

    res.status(200).json({
      success: true,
      sessions: formattedSessions,
    });
  } catch (error) {
    console.error("Error al obtener sesiones por clientId:", error.message);
    res.status(500).json({
      success: false,
      message: "Error al obtener el historial de sesiones",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Obtener una sesión por ID
exports.getSessionById = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id)
      .populate("clientId", "name email")
      .populate("userId", "name email")
      .populate("adminId", "name email");

    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }
    res.status(200).json(session);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// Agrega este controlador al final de tus controladores existentes
exports.getSessionByAppointmentId = async (req, res) => {
  try {
    const session = await Session.findOne({
      appointmentId: req.params.appointmentId,
    })

      .populate("clientId", "name email")
      .populate("userId", "name email")
      .populate("adminId", "name email");

    if (!session) {
      return res
        .status(404)
        .json({ message: "Session not found for this appointment" });
    }
    res.status(200).json({ success: true, session });
  } catch (error) {
    res.status(500).json({ success: true, message: error.message });
  }
};

// Actualizar una sesión
exports.updateSession = async (req, res) => {
  const dbSession = await mongoose.startSession();
  dbSession.startTransaction();

  try {
    const { id } = req.params;
    const updateData = req.body;

    // 1. Validar existencia de la sesión
    const existingSession = await Session.findById(id).session(dbSession);
    if (!existingSession) {
      throw new Error("Sesión no encontrada");
    }

    // 2. Validar estructura de los datos de actualización
    if (updateData.routine && !Array.isArray(updateData.routine)) {
      throw new Error("El campo routine debe ser un array");
    }

    // 3. Preparar datos para actualización
    const allowedFields = ["done", "routine", "adminId"];

    const filteredUpdate = {};
    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        filteredUpdate[field] = updateData[field];
      }
    }

    // 4. Procesamiento especial para rutinas
    if (filteredUpdate.routine) {
      filteredUpdate.routine = updateData.routine.map((block) => ({
        ...block,
        exercises:
          block.exercises?.map((exercise) => ({
            ...exercise,
            sets:
              exercise.sets?.map((set) => ({
                ...set,
                completed: set.completed !== undefined ? set.completed : false,
              })) || [],
          })) || [],
      }));
    }

    // 5. Actualizar con validación completa
    const updatedSession = await Session.findByIdAndUpdate(
      id,
      { $set: filteredUpdate },
      {
        new: true,
        runValidators: true,
        session: dbSession,
      }
    ).populate("clientId userId adminId", "name email");

    // 6. Si se marca como done, actualizar cita relacionada
    if (filteredUpdate.done === true) {
      await Appointment.findByIdAndUpdate(
        existingSession.appointmentId,
        { $set: { status: "completed" } },
        { session: dbSession }
      );
    }

    await dbSession.commitTransaction();

    res.status(200).json({
      success: true,
      data: updatedSession,
      message: "Sesión actualizada exitosamente",
    });
  } catch (error) {
    await dbSession.abortTransaction();

    console.error("Error al actualizar sesión:", error.message);

    const statusCode = error.message.includes("no encontrada")
      ? 404
      : error instanceof mongoose.Error.ValidationError
      ? 400
      : 500;

    res.status(statusCode).json({
      success: false,
      message: error.message,
      details: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  } finally {
    dbSession.endSession();
  }
};

// Eliminar una sesión
exports.deleteSession = async (req, res) => {
  try {
    const deletedSession = await Session.findByIdAndDelete(req.params.id);

    if (!deletedSession) {
      return res.status(404).json({ message: "Session not found" });
    }
    res.status(200).json({ message: "Session deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Rutinas específicas

// Añadir item de rutina a una sesión
exports.addRoutineItem = async (req, res) => {
  try {
    const session = await Session.findById(req.params.sessionId);

    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    session.routine.push(req.body);
    const updatedSession = await session.save();
    res.status(200).json(updatedSession);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Actualizar item de rutina
exports.updateRoutineItem = async (req, res) => {
  try {
    const session = await Session.findById(req.params.sessionId);

    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    const routineItem = session.routine.id(req.params.routineItemId);
    if (!routineItem) {
      return res.status(404).json({ message: "Routine item not found" });
    }

    routineItem.set(req.body);
    const updatedSession = await session.save();
    res.status(200).json(updatedSession);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Eliminar item de rutina
exports.deleteRoutineItem = async (req, res) => {
  try {
    const session = await Session.findById(req.params.sessionId);

    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    session.routine.pull(req.params.routineItemId);
    const updatedSession = await session.save();
    res.status(200).json(updatedSession);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Manejo de ejercicios dentro de rutinas

// Añadir ejercicio a un item de rutina
exports.addExerciseToRoutine = async (req, res) => {
  try {
    const session = await Session.findById(req.params.sessionId);

    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    const routineItem = session.routine.id(req.params.routineItemId);
    if (!routineItem) {
      return res.status(404).json({ message: "Routine item not found" });
    }

    routineItem.exercises.push(req.body);
    const updatedSession = await session.save();
    res.status(200).json(updatedSession);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Actualizar ejercicio en un item de rutina
exports.updateExerciseInRoutine = async (req, res) => {
  try {
    const session = await Session.findById(req.params.sessionId);

    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    const routineItem = session.routine.id(req.params.routineItemId);
    if (!routineItem) {
      return res.status(404).json({ message: "Routine item not found" });
    }

    const exercise = routineItem.exercises.id(req.params.exerciseId);
    if (!exercise) {
      return res.status(404).json({ message: "Exercise not found" });
    }

    exercise.set(req.body);
    const updatedSession = await session.save();
    res.status(200).json(updatedSession);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Eliminar ejercicio de un item de rutina
exports.deleteExerciseFromRoutine = async (req, res) => {
  try {
    const session = await Session.findById(req.params.sessionId);

    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    const routineItem = session.routine.id(req.params.routineItemId);
    if (!routineItem) {
      return res.status(404).json({ message: "Routine item not found" });
    }

    routineItem.exercises.pull(req.params.exerciseId);
    const updatedSession = await session.save();
    res.status(200).json(updatedSession);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Manejo de sets dentro de ejercicios

// Añadir set a un ejercicio
exports.addSetToExercise = async (req, res) => {
  try {
    const session = await Session.findById(req.params.sessionId);

    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    const routineItem = session.routine.id(req.params.routineItemId);
    if (!routineItem) {
      return res.status(404).json({ message: "Routine item not found" });
    }

    const exercise = routineItem.exercises.id(req.params.exerciseId);
    if (!exercise) {
      return res.status(404).json({ message: "Exercise not found" });
    }

    exercise.sets.push(req.body);
    const updatedSession = await session.save();
    res.status(200).json(updatedSession);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Actualizar set en un ejercicio
exports.updateSetInExercise = async (req, res) => {
  try {
    const session = await Session.findById(req.params.sessionId);

    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    const routineItem = session.routine.id(req.params.routineItemId);
    if (!routineItem) {
      return res.status(404).json({ message: "Routine item not found" });
    }

    const exercise = routineItem.exercises.id(req.params.exerciseId);
    if (!exercise) {
      return res.status(404).json({ message: "Exercise not found" });
    }

    const set = exercise.sets.id(req.params.setId);
    if (!set) {
      return res.status(404).json({ message: "Set not found" });
    }

    set.set(req.body);
    const updatedSession = await session.save();
    res.status(200).json(updatedSession);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Eliminar set de un ejercicio
exports.deleteSetFromExercise = async (req, res) => {
  try {
    const session = await Session.findById(req.params.sessionId);

    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    const routineItem = session.routine.id(req.params.routineItemId);
    if (!routineItem) {
      return res.status(404).json({ message: "Routine item not found" });
    }

    const exercise = routineItem.exercises.id(req.params.exerciseId);
    if (!exercise) {
      return res.status(404).json({ message: "Exercise not found" });
    }

    exercise.sets.pull(req.params.setId);
    const updatedSession = await session.save();
    res.status(200).json(updatedSession);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
