const mongoose = require("mongoose");

// ----- Esquema para Exercise (para evitar duplicación y mejorar consistencia) -----
const exerciseSchema = new mongoose.Schema(
  {
    _id: { type: mongoose.Schema.Types.ObjectId, required: true },
    name: { type: String, required: true },
    description: { type: String, default: "" },
    videoUrls: { type: [String], default: [] },
    imageUrls: { type: [String], default: [] },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { _id: false }
); // _id: false porque ya viene con el _id del ejercicio original

// ----- Esquema para Sensor (modularizado) -----
const sensorSchema = new mongoose.Schema(
  {
    useSensor: { type: Boolean, default: false },
    sensorType: {
      type: String,
      enum: ["accelerometer", "gyroscope", "force", "other"],
      default: "accelerometer",
    },
    description: { type: String, default: "" },
    position: { type: String, default: "" },
    videoUrls: { type: [String], default: [] },
    imageUrls: { type: [String], default: [] },
  },
  { _id: false }
);

// ----- Esquema para Sets (con validaciones) -----
const setSchema = new mongoose.Schema(
  {
    reps: { type: Number, min: 0, default: 0 },
    weight: { type: Number, min: 0, default: 0 },
    duration: { type: Number, min: 0, default: 0 }, // en segundos
    break: { type: Number, min: 0, default: 0 }, // en segundos
    completed: { type: Boolean, default: false },
    zone: { type: String, default: "" },
    observations: { type: String, default: "" },
  },
  { _id: false }
);

// ----- Esquema para Exercise en Rutina -----
const routineExerciseSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["dosed", "timed", "free"],
      required: true,
    },
    done: { type: Boolean, default: false },
    sets: { type: [setSchema], default: [] },
    exercise: { type: exerciseSchema, required: true },
    sensor: { type: sensorSchema, default: () => ({}) },
    observations: { type: String, default: "" },
  },
  { _id: false }
);

// ----- Esquema para Bloques de Rutina -----
const routineBlockSchema = new mongoose.Schema(
  {
    isCircuit: { type: Boolean, required: true },
    done: { type: Boolean, default: false },
    moment: {
      type: String,
      enum: ["warmUp", "workOut", "coolDown", "other"],
      required: true,
    },
    circuitPause: { type: Number, min: 0, default: 0 }, // en segundos
    details: {
      text: { type: String, default: "" },
      videoUrls: { type: [String], default: [] },
      imageUrls: { type: [String], default: [] },
    },

    exercises: { type: [routineExerciseSchema], required: true },
  },
  { _id: false }
);

// ----- Esquema Principal de Session -----
const sessionSchema = new mongoose.Schema({
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Appointment",
  },
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Client",
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  done: { type: Boolean, default: false },
  routine: { type: [routineBlockSchema], default: [] },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// ----- Middlewares -----
sessionSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// ----- Índices para Mejorar Performance -----
sessionSchema.index({ appointmentId: 1 }); // Búsqueda rápida por cita
sessionSchema.index({ clientId: 1, createdAt: -1 }); // Para historial de sesiones
sessionSchema.index({ "routine.exercises.exercise._id": 1 }); // Búsqueda por ejercicio

module.exports = mongoose.model("Session", sessionSchema);
