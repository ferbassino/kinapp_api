const MotionTest = require("../models/motion");
const User = require("../models/user");
const Client = require("../models/client");

exports.getMotionTests = async (request, response) => {
  try {
    const motionTests = await MotionTest.find();

    if (motionTests) {
      response.json({
        success: true,
        motionTests,
      });
    }
    if (!motionTests) {
      console.log(error.message);
      response.status(400).end();
    }
  } catch (error) {
    console.log(error.message);
  }
};
exports.getMotionTest = async (request, response) => {
  const { id } = request.params;
  try {
    const motionTest = await MotionTest.findById(id);

    if (motionTest) {
      response.json({
        success: true,
        motionTest,
      });
    }
    if (!motionTest) {
      console.log(error.message);
      response.status(400).end();
    }
  } catch (error) {
    console.log(error.message);
    response.status(400).end();
  }
};

exports.createMotionTest = async (request, response) => {
  try {
    const {
      email,
      motionType,
      corporalPart,
      segment,
      side,
      opposite,
      motion,
      accData,
      gyroData,
      magData,
      kinoveaData,
      videoFrameRate,
      testTime,
      mass,
      weight,
      size,
      gender,
      pALevel,
      mPActivity,
      mFComponents,
      age,
      userId,
      clientId,
    } = request.body;
    const user = await User.findById(userId);
    const client = await Client.findById(clientId);
    const motionTest = await MotionTest({
      email,
      motionType,
      corporalPart,
      segment,
      side,
      opposite,
      motion,
      accData,
      gyroData,
      magData,
      kinoveaData,
      videoFrameRate,
      testTime,
      mass,
      weight,
      size,
      gender,
      pALevel,
      mPActivity,
      mFComponents,
      age,
      userId: user._id,
      clientId: client._id,
    });

    const savedMotionTest = await motionTest.save();
    user.motion = user.motion.concat(savedMotionTest._id);
    await user.save();
    client.motion = client.motion.concat(savedMotionTest._id);

    await client.save();

    response.json({ success: true, savedMotionTest });
  } catch (error) {
    response.json({ success: false, error: error.message });
  }
};

exports.updateMotion = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await MotionTest.findByIdAndUpdate(
      id,
      {
        opposite: req.body.opposite,
      },
      { new: true }
    );

    res.json({ success: true, updatedMotion: result });
  } catch (error) {
    response.json({ success: false, error: error.message });
  }
};
exports.deleteMotion = async (req, res) => {
  try {
    const result = await MotionTest.findByIdAndDelete(req.params.id);
    res.json({ success: true, result });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
};
