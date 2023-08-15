require("dotenv").config();
const mongoose = require("mongoose");
const PASSWORD = process.env.DB_PASSWORD;

const URI = `mongodb+srv://ferbassino:${PASSWORD}@cluster0.fu84jsk.mongodb.net/kin-app-auth?retryWrites=true&w=majority`;
module.exports = mongoose
  .connect(URI)
  .then(() => {
    console.log("kin-app database connected");
  })
  .catch((error) => console.log(error.message));
