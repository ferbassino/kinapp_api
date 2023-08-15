require("dotenv").config();
const mongoose = require("mongoose");
console.log("process", process.env.MONGO_URI);
const URI =
  "mongodb+srv://ferbassino:6U4Xnn6kaZOBjAhl@cluster0.fu84jsk.mongodb.net/kin-app-auth?retryWrites=true&w=majority";
module.exports = mongoose
  .connect(URI)
  .then(() => {
    console.log("kin-app database connected");
  })
  .catch((error) => console.log(error.message));
