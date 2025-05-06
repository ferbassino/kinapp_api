const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const adminSchema = new mongoose.Schema({
  userName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  cellPhone: {
    type: String,
    required: true,
  },
  mobCode: {
    type: String,
    default: "0000",
    required: true,
  },
  avatar: {
    type: String,
    default: "",
  },
  verified: {
    type: Boolean,
    default: false,
    required: true,
  },
  roles: {
    type: String,
    default: "admin", // Rol por defecto para administradores
  },
  level: {
    type: String,
    default: "cero",
  },
  apps: {
    type: Object,
    default: { translation: true, rotation: false, jump: false },
  },
  data: {
    type: Object,
    default: { state: "active", name: "example", cellphone: 12345678 },
  },
  courses: {
    type: Array,
    default: [
      {
        id: "0",
        name: "example",
        active: true,
        state: "active",
        duration: 2628000000,
        initialDay: 1719918244489,
        finalDay: 1722546244489,
        score: 10,
      },
    ],
  },
  currentDate: {
    type: Date,
    default: Date.now,
  },
  initialDate: { type: Date, default: Date.now },
  payday: { type: Date, default: Date.now },
  motionId: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Motion",
    },
  ],
  clientId: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
    },
  ],
  userId: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Referencia al modelo "User"
    },
  ],
  // Campos específicos para administradores
  permissions: {
    type: Object,
    default: {
      manageUsers: true,
      manageClients: true,
      manageCourses: true,
      manageAppointments: true,
    },
  },
  isSuperAdmin: {
    type: Boolean,
    default: false, // Indica si el administrador es un superadmin
  },
});

// Método para comparar contraseñas
adminSchema.methods.comparePassword = async function (password) {
  if (!password) throw new Error("password is missing, can not compare!");
  try {
    const result = await bcrypt.compare(password, this.password);
    return result;
  } catch (error) {
    console.log("Error while comparing password", error.message);
  }
};

// Middleware para hashear la contraseña antes de guardar
// adminSchema.pre("save", async function (next) {
//   if (this.isModified("password")) {
//     try {
//       const salt = await bcrypt.genSalt(8);
//       this.password = await bcrypt.hash(this.password, salt);
//       next();
//     } catch (error) {
//       next(error);
//     }
//   } else {
//     next();
//   }
// });

module.exports = mongoose.model("Admin", adminSchema);
