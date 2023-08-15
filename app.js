const express = require("express");
const app = express();
require("dotenv").config();
require("./db/index");
const cors = require("cors");
const userRouter = require("./routes/user");
const motionRouter = require("./routes/motion");
const clientRouter = require("./routes/client");
const postsRouter = require("./routes/posts");
const testsRouter = require("./routes/tests");
const bodyParser = require("body-parser");
const imuDataRouter = require("./routes/imuData");
const ImuData = require("./models/imuData");
const mongoose = require("mongoose");

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
app.get("/kin", (request, response) => {
  response.json({ success: true, message: "kinapp" });
});

app.use(motionRouter);
app.use(userRouter);
app.use(clientRouter);
app.use("/posts", postsRouter);

app.use(testsRouter);
app.get("/api/imudata", async (request, response) => {
  try {
    const imuDatas = await ImuData.find();

    if (imuDatas) {
      response.json({
        success: true,
        imuDatas,
      });
    }
    if (!imuDatas) {
      console.log(error.message);
      response.status(400).end();
    }
  } catch (error) {
    console.log(error.message);
  }
});
// app.use(imuDataRouter);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`listening on port: ${PORT}`);
});
