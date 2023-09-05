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
      motionType,
      corporalPart,
      segment,
      side,
      motion,
      accData,
      gyroData,
      magData,
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
      motionId,
    } = request.body;
    const user = await User.findById(userId);
    const client = await Client.findById(clientId);
    const motionRef = await MotionTest.findById(motionId);

    const motionTest = await MotionTest({
      motionType,
      corporalPart,
      segment,
      side,
      motion,
      accData,
      gyroData,
      magData,
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
      motionId: motionRef._id,
    });

    const savedMotionTest = await motionTest.save();

    user.motion = user.motion.concat(savedMotionTest._id);
    await user.save();

    client.motion = client.motion.concat(savedMotionTest._id);
    await client.save();

    motionRef.motionId = motionRef.motionId.concat(savedMotionTest._id);
    await motionRef.save();

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
        motionId: req.body.motionId,
      },
      { new: true }
    );

    res.json({ updatedMotion: result });
  } catch (error) {
    console.log(error);
  }
};
