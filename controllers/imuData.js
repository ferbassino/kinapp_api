const ImuData = require("../models/imuData");
const mongoose = require("mongoose");

exports.getImuDatas = async (request, response) => {
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
};

exports.getImuData = async (request, response) => {
  const { id } = request.params;
  try {
    const imuData = await ImuData.findById(id);

    if (imuData) {
      response.json({
        success: true,
        imuData,
      });
    }
    if (!imuData) {
      console.log(error.message);
      response.status(400).end();
    }
  } catch (error) {
    console.log(error.message);
    response.status(400).end();
  }
};
exports.deleteImuData = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id))
    return res.status(404).send(`No Tests with id: ${id}`);

  await ImuData.findByIdAndRemove(id);

  res.json({ message: "Tests deleted successfully." });
};

exports.createImuData = async (request, response) => {
  try {
    const { name, version, downloads } = request.body;
    const newImuData = new ImuData({
      name,
      version,
      downloads,
    });
    console.log(newImuData);
    await newImuData.save();
    response.json({
      success: true,
      message: "imuData saved database successfully",
    });
  } catch (error) {
    response.json({
      success: false,
      message: "error saving database",
    });
  }
};

exports.updateImuData = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await ImuData.findByIdAndUpdate(
      id,
      {
        name: req.body.name,
        version: req.body.version,
        downloads: req.body.downloads,
      },
      { new: true }
    );

    res.json({ updatedImudata: result });
  } catch (error) {
    console.log(error);
  }
};
