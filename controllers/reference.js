const Reference = require("../models/reference");

exports.createReference = async (request, response) => {
  try {
    const {
      motionType,
      corporalPart,
      segment,
      motion,
      maxRefAngle,
      minRefAngle,
    } = request.body;

    const reference = await Reference({
      motionType,
      corporalPart,
      segment,
      motion,
      maxRefAngle,
      minRefAngle,
    });

    const savedReference = await reference.save();

    response.json({ success: true, savedReference });
  } catch (error) {
    response.json({ success: false, error: error.message });
  }
};
