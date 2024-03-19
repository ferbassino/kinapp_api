const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const anatoUserSchema = new mongoose.Schema({
  userName: {
    type: String,
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
  verified: {
    type: Boolean,
    default: true,
  },
  roles: {
    type: String,
    default: "reader",
  },
});

anatoUserSchema.methods.comparePassword = async function (password) {
  if (!password) throw new Error("password is missing, can not compare!");
  try {
    const result = await bcrypt.compare(password, this.password);
    return result;
  } catch (error) {
    console.log("Error while comparing password", error.message);
  }
};

//

module.exports = mongoose.model("AnatoUser", anatoUserSchema);
