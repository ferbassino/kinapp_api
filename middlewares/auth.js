const jwt = require("jsonwebtoken");
const User = require("../models/user");

exports.isAuth = async (request, response, next) => {
  //if there are headers and authorization
  if (request.headers && request.headers.authorization) {
    const token = request.headers.authorization.split(" ")[1];

    try {
      //save decoded token
      const decode = jwt.verify(token, process.env.JWT_SECRET);
      //search user by id because the sign say that
      const user = await User.findById(decode.userId);
      if (!user) {
        return response.json({
          success: false,
          message: "unauthorized access!",
        });
      }

      request.user = user;
      next();
    } catch (error) {
      console.log("JsonWebTokenError", error);
      if (error.name === "") {
        return response.json({
          success: false,
          message: "unauthorized access!",
        });
      }
      if (error.name === "TokenExpiredError") {
        console.log("TokenExpiredError", error);
        return response.json({
          success: false,
          message: "session expired try sign in!",
        });
      }
      console.log("internal server error");
      response.response.json({
        success: false,
        message: "Internal server error!",
      });
    }
  } else {
    console.log("unauthorized access!");
    response.json({ success: false, message: "unauthorized access!" });
  }
};
