require("dotenv").config();
const mongoose = require("mongoose");

module.exports = mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("kin-app database connected");
  })
  .catch((error) => console.log(error.message));
