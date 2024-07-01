const express = require("express");
const app = express();
require("dotenv").config();
require("./db/index");
const cors = require("cors");
const userRouter = require("./routes/user");
const motionRouter = require("./routes/motion");
const clientRouter = require("./routes/client");

const bodyParser = require("body-parser");
const imuDataRouter = require("./routes/imuData");
const ImuData = require("./models/imuData");
const mongoose = require("mongoose");

const productsRouter = require("./routes/products");
// ------------------
app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));
// ------------------

app.use(express.json());

app.use(
  cors({
    origin: "*",
  })
);
// app.use(cors());
app.get("/", (request, response) => {
  response.json({ success: true, message: "welcome to backend" });
});

app.use(motionRouter);

app.use(userRouter);
app.use(clientRouter);
app.use(imuDataRouter);
app.use(productsRouter);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`listening on port: ${PORT}`);
});
