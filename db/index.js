require("dotenv").config();
const mongoose = require("mongoose");
console.log("process", process.env.MONGO_URI);
module.exports = mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("kin-app database connected");
  })
  .catch((error) => console.log(error.message));
