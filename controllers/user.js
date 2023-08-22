const User = require("../models/user");
const VerificationToken = require("../models/verificationToken");
const jwt = require("jsonwebtoken");
const sharp = require("sharp");
const bcrypt = require("bcrypt");

const cloudinary = require("../helper/imageUpload");
const {
  generateOtp,
  mailTransport,
  generateEmailTemplate,
  plainEmailTemplate,
  generatePasswordResetTemplate,
} = require("../helper/mail");
const { sendError } = require("../helper/errors");
const { isValidObjectId } = require("mongoose");
const verificationToken = require("../models/verificationToken");
const ResetToken = require("../models/resetToken");
const { createRandomBytes } = require("../helper/crypto");
const { transporter } = require("../helper/mailer");

exports.createUser = async (request, response) => {
  const { userName, email, password } = request.body;

  const userEmail = await User.findOne({ email });
  // const isNewUser = await User.isThisEmailInUse(email);

  if (userEmail)
    return response.json({
      success: false,
      message: "This email is already in use, try sign-in",
    });

  //password hash

  const passwordHash = await bcrypt.hash(password, 8);

  const user = await User({
    userName,
    email,
    password: passwordHash,
  });

  //otp generator and verification token

  const OTP = generateOtp();

  const verificationToken = new VerificationToken({
    owner: user._id,
    token: OTP,
  });

  await verificationToken.save();

  try {
    await transporter.sendMail({
      from: "kinappbiomechanics@gmail.com", // sender address
      to: user.email, //
      subject: "verify your email account", // Subject line
      html: generateEmailTemplate(OTP),
    });
  } catch (error) {
    console.log(error);
  }

  await user.save();
  response.json({
    success: true,
    user: {
      userName: user.userName,
      email: user.email,
      id: user._id,
      avatar: user.avatar ? user.avatar : "",
      verified: user.verified,
      roles: user.roles,
      array,
      object: { translation: false, rotation: false, jump: true },
    },
  });
};

exports.signIn = async (request, response) => {
  try {
    const { email, password } = request.body;

    if (!email.trim() || !password.trim())
      return sendError(response, "email / password missing");

    const user = await User.findOne({ email });

    if (!user)
      return response.json({
        success: false,
        message: "user not found, whit the given email",
      });

    // compare Password

    const isMatch = await bcrypt.compare(password, user.password);

    // ------------

    // const isMatch = await UserSchema.comparePassword(password);
    if (!isMatch)
      return response.json({
        success: false,
        message: "password does not match",
      });
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    //old tokens
    // let oldTokens = user.tokens || [];

    // if (oldTokens.length) {
    //   oldTokens = oldTokens.filter((t) => {
    //     const timeDiff = (Date.now() - parseInt(t.signedAt)) / 1000;
    //     if (timeDiff < 86400) {
    //       return t;
    //     }
    //   });
    // }

    // await User.findByIdAndUpdate(user._id, {
    //   tokens: [...oldTokens, { token, signedAt: Date.now().toString() }],
    // });
    //---------------

    // const userInfo = {
    //   userName: user.userName,
    //   email: user.email,
    //   avatar: user.avatar ? user.avatar : "",
    // };
    response.json({
      success: true,
      user: {
        id: user._id,
        userName: user.userName,
        email: user.email,
        password: user.password,
        avatar: user.avatar ? user.avatar : "",
        token,
        roles: user.roles,
        verified: user.verified,
      },
      // user: userInfo,
      // token,
    });
  } catch (error) {
    sendError(response, error.message, 500);
  }
};

exports.uploadProfile = async (request, response) => {
  const { user } = request;
  if (!user)
    return response
      .status(401)
      .json({ success: false, message: "unauthorized access!" });

  try {
    const result = await cloudinary.uploader.upload(request.file.path, {
      public_id: `${user._id}_profile`,
      width: 500,
      height: 500,
      crop: "fill",
    });

    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      { avatar: result.url },
      { new: true }
    );
    response
      .status(201)
      .json({ user, success: true, message: "Your profile has updated!" });
  } catch (error) {
    response
      .status(500)
      .json({ success: false, message: "server error, try after some time" });
  }
};

exports.signOut = async (req, res) => {
  if (req.headers && req.headers.authorization) {
    const token = req.headers.authorization.split(" ")[1];

    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "Authorization fail!" });
    }

    // const tokens = req.user.tokens;

    // const newTokens = tokens.filter((t) => t.token !== token);
    // await User.findByIdAndUpdate(req.user._id, { tokens: newTokens });
    await User.findByIdAndUpdate(req.user._id, { token });
    res.json({ success: true, message: "Sign out successfully!" });
  }
};

exports.verifyEmail = async (req, res) => {
  const { userId, otp } = req.body;
  if (!userId || !otp.trim())
    return res.status(401).json({
      success: false,
      message: "Invalid request, missing parameters!",
    });

  if (!isValidObjectId(userId)) return sendError(res, "Invalid user id");

  const user = await User.findById(userId);

  if (!user)
    return res.status(401).json({
      success: false,
      message: "Sorry, user not found!",
    });

  if (user.verified)
    return res.status(401).json({
      success: false,
      message: "This account is already verified",
    });

  const token = await VerificationToken.findOne({ owner: user._id });

  if (!token)
    return res.status(401).json({
      success: false,
      message: "Sorry, user not found",
    });

  const isMatched = await token.compareToken(otp);

  if (!isMatched)
    return res.status(401).json({
      success: false,
      message: "Please, provide a valid token",
    });

  user.verified = true;

  await verificationToken.findByIdAndDelete(token._id);

  await User.findByIdAndUpdate(user._id, user);

  try {
    await transporter.sendMail({
      from: "<kinappbiomechanics@gmail.com>", // sender address
      to: user.email, //
      subject: "Welcome email",

      html: plainEmailTemplate(
        "Email verify successfully",
        "Tanks for connecting with us"
      ),
    });
  } catch (error) {
    console.log(error);
  }

  res.json({
    success: true,
    message: "Your email is verified",
    user: {
      userName: user.userName,
      email: user.email,
      id: user._id,
      avatar: user.avatar ? user.avatar : "",
    },
  });
};

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) return sendError(res, "Please, provide a valid email");
  const user = await User.findOne({ email });

  if (!user)
    return res.json({
      success: false,
      message: "user not found, whit the given email",
    });

  const token = await ResetToken.findOne({ owner: user._id });
  if (token)
    return sendError(
      res,
      "Only after one hour you can request for another token"
    );

  const randomBytes = await createRandomBytes();

  const resetToken = new ResetToken({ owner: user._id, token: randomBytes });
  await resetToken.save();

  //nodemailer

  try {
    await transporter.sendMail({
      from: "<kinappbiomechanics@gmail.com>", // sender address
      to: user.email, //
      subject: "Password reset",

      html: generatePasswordResetTemplate(
        user.userName,
        `https://reset-mu.vercel.app/reset-password?token=${randomBytes}&id=${user._id}`
      ),
    });
  } catch (error) {
    console.log(error);
  }

  res.json({
    success: true,
    message: "Password reset link is sent to your email",
  });
};

exports.resetPassword = async (req, res) => {
  const { password } = req.body;

  const user = await User.findById(req.user._id);
  if (!user) return sendError(res, "user not found");

  const isSamePassword = await user.comparePassword(password);

  if (isSamePassword) return sendError(res, "New password must be different");

  if (password.trim().length < 8 || password.trim().length > 8)
    return sendError(res, "New password must 8 to 20 characters long");

  // ----------------------------
  const passwordHash = await bcrypt.hash(password.trim(), 8);
  // ----------------------------

  user.password = passwordHash;
  await user.save();
  await ResetToken.findOneAndDelete({ owner: user._id });

  try {
    await transporter.sendMail({
      from: "<kinappbiomechanics@gmail.com>", // sender address
      to: user.email, //
      subject: "Password reset successfully",

      html: plainEmailTemplate(
        "Password reset successfully",
        "Now you can login with new password"
      ),
    });
  } catch (error) {
    console.log(error);
  }

  res.json({ success: true, message: "Password reset successfully" });
};

exports.getAllUsers = async (req, res) => {
  const users = await User.find({});
  res.json({ success: true, users: users });
};

exports.getUsers = async (request, response) => {
  try {
    const users = await User.find();

    if (users) {
      response.json({
        success: true,
        users,
      });
    }
    if (!users) {
      console.log(error.message);
      response.status(400).end();
    }
  } catch (error) {
    console.log(error.message);
  }
};
