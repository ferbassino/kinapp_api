const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  dni: {
    type: String,
  },
  ingreso: {
    type: String,
  },
  apellido: {
    type: String,
  },
  nombres: {
    type: String,
  },
  comision: {
    type: String,
  },
  horarioComision: {
    type: String,
  },
  asistencia: {
    type: Object,
    default: {
      tp1: "",
      tp2: "",
      tp3: "",
      tp4: "",
      tp5: "",
      tp6: "",
      tp7: "",
      tp8: "",
      tp9: "",
      tp10: "",
      tp11: "",
      tp12: "",
      tp13: "",
      tp14: "",
      tp15: "",
      tp16: "",
      tp17: "",
      tp18: "",
      tp19: "",
      tp20: "",
      tp21: "",
      tp22: "",
      tp23: "",
      tp24: "",
      tp25: "",
      tp26: "",
      tp27: "",
    },
  },
  parciales: {
    type: Object,
    default: {
      parcial1Teorico: 0,
      parcial1Practico: 0,
      recuperatorio1Teorico: 0,
      recuperatorio1Practico: 0,
      nota1Modulo: 0,
      parcial2Teorico: 0,
      parcial2Practico: 0,
      recuperatorio2Teorico: 0,
      recuperatorio2Practico: 0,
      nota2Modulo: 0,
      parcial3Teorico: 0,
      parcial3Practico: 0,
      recuperatorio3Teorico: 0,
      recuperatorio3Practico: 0,
      nota3Modulo: 0,
    },
  },
  finales: {
    type: Object,
    default: {
      final1: 0,
      final2: 0,
      final3: 0,
      final4: 0,
      final5: 0,
    },
  },
  cursada: {
    type: String,
    default: "2024",
  },
  condición: {
    type: String,
  },
  roles: {
    type: String,
    default: "student",
  },
});

//

module.exports = mongoose.model("Student", studentSchema);
