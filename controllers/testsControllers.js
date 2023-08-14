const express = require("express");
const mongoose = require("mongoose");
const Tests = require("../models/tests");
const router = express.Router();
const User = require("../models/user");
const Client = require("../models/client");

exports.getTests = async (req, res) => {
  try {
    const allTests = await Tests.find();
    res.status(200).json(allTests);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

exports.getTest = async (req, res) => {
  const { id } = req.params;

  try {
    const Test = await Tests.findById(id);
    res.status(200).json(Test);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

exports.createTest = async (req, res) => {
  const {
    email,
    motionType,
    segment,
    side,
    size,
    weight,
    gender,
    pALevel,
    age,
    accX,
    accY,
    accZ,
    accTime,
    velX,
    velY,
    velZ,
    velTime,
    magX,
    magY,
    magZ,
    magTime,
    testTime,
    dataArray,
    dataObject,
    userId,
    clientId,
  } = req.body;
  const user = await User.findById(userId);
  const client = await Client.findById(clientId);
  const newTest = new Tests({
    email,
    motionType,
    segment,
    side,
    size,
    weight,
    gender,
    pALevel,
    age,
    accX,
    accY,
    accZ,
    accTime,
    velX,
    velY,
    velZ,
    velTime,
    magX,
    magY,
    magZ,
    magTime,
    testTime,
    dataArray,
    dataObject,
  });

  try {
    await newTest.save();
    user.motion = user.motion.concat(newTest._id);
    await user.save();
    client.motion = client.motion.concat(newTest._id);

    await client.save();
    res.status(201).json(newTest);
  } catch (error) {
    console.log("el error de gettests");
    res.status(409).json({ message: error.message });
  }
};

exports.deleteTest = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id))
    return res.status(404).send(`No Tests with id: ${id}`);

  await Tests.findByIdAndRemove(id);

  res.json({ message: "Tests deleted successfully." });
};
