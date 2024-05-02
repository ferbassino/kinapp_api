const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const MotionTest = require("../models/motion");

const userSchema = new mongoose.Schema({
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
    default: "reader",
  },
  apps: {
    type: Object,
    default: { translation: true, rotation: false, jump: false },
  },
  data: {
    type: Object,
    default: { state: "active", name: "example", cellphone: 12345678 },
  },
  currentDate: {
    type: Number,
    default: 1708363553024,
  },
  initialDate: { type: Date, default: Date.now },
  motion: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tests",
    },
  ],
  client: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
    },
  ],
  // tokens: [{ type: Object }],
});

// userSchema.pre("save", function (next) {
//   if (this.isModified("password")) {
//     bcrypt.hash(this.password, 8, (error, hash) => {
//       if (error) return next(error);
//       this.password = hash;
//       next();
//     });
//   }
// });

userSchema.methods.comparePassword = async function (password) {
  if (!password) throw new Error("password is missing, can not compare!");
  try {
    const result = await bcrypt.compare(password, this.password);
    return result;
  } catch (error) {
    console.log("Error while comparing password", error.message);
  }
};

// userSchema.statics.isThisEmailInUse = async function (email) {
//   if (!email) throw new Error("Invalid Email");
//   try {
//     const user = await this.findOne({ email });

//     if (user) return false;

//     return true;
//   } catch (error) {
//     console.log("error inside isThisEmailInUse method", error.message);
//     return false;
//   }
// };

module.exports = mongoose.model("User", userSchema);
