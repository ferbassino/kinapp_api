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
  const { userName, email, cellPhone, password } = request.body;

  const userEmail = await User.findOne({ email });

  if (userEmail)
    return response.json({
      success: false,
      message: "This email is already in use, try sign-in",
    });

  const passwordHash = await bcrypt.hash(password, 8);

  const user = await User({
    userName,
    email,
    cellPhone,
    password: passwordHash,
  });

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
      cellPhone: user.cellPhone,
      id: user._id,
      avatar: user.avatar ? user.avatar : "",
      verified: user.verified,
      roles: user.roles,
      object: user.apps,
      data: user.data,
      mobCode: user.mobCode,
      courses: user.courses,
    },
  });
};

exports.resendUserCode = async (request, response) => {
  const { userId, email } = request.body;

  if (!userId || !email) {
    return response.status(400).json({
      success: false,
      error: "Faltan parámetros requeridos: userId o email",
    });
  }

  try {
    // Buscar usuario por userId
    const user = await User.findById(userId);
    if (!user) {
      return response.status(404).json({
        success: false,
        error: "Usuario no encontrado",
      });
    }

    // Verificar si el email coincide con el del usuario
    if (user.email !== email) {
      return response.status(400).json({
        success: false,
        error:
          "El email proporcionado no coincide con el registrado para este usuario",
      });
    }

    // Eliminar el token anterior si existe
    const existingToken = await VerificationToken.findOne({ owner: user._id });
    if (existingToken) {
      await VerificationToken.findByIdAndDelete(existingToken._id);
    }

    // Generar nuevo código OTP
    const OTP = generateOtp();

    // Crear y guardar un nuevo token de verificación
    const verificationToken = new VerificationToken({
      owner: user._id,
      token: OTP,
    });

    await verificationToken.save();

    // Enviar el correo con el código OTP
    try {
      await transporter.sendMail({
        from: "kinappbiomechanics@gmail.com",
        to: user.email,
        subject: "Verifica tu cuenta de correo",
        html: generateEmailTemplate(OTP),
      });
    } catch (emailError) {
      console.error("Error al enviar el correo:", emailError);
      return response.status(500).json({
        success: false,
        error: "Hubo un error al enviar el correo de verificación",
      });
    }

    // Devolver una respuesta exitosa
    return response.json({
      success: true,
      user: {
        userName: user.userName,
        email: user.email,
        cellPhone: user.cellPhone,
        id: user._id,
        avatar: user.avatar || "",
        verified: user.verified,
        roles: user.roles,
        object: user.apps,
        data: user.data,
        mobCode: user.mobCode,
        courses: user.courses,
      },
    });
  } catch (error) {
    console.error("Error en resendUserCode:", error);
    return response.status(500).json({
      success: false,
      error: "Hubo un error en el servidor. Intenta nuevamente más tarde",
    });
  }
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

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch)
      return response.json({
        success: false,
        message: "password does not match",
      });
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    response.json({
      success: true,
      user: {
        id: user._id,
        userName: user.userName,
        email: user.email,
        cellPhone: user.cellPhone,
        avatar: user.avatar ? user.avatar : "",
        token,
        roles: user.roles,
        level: user.level,
        verified: user.verified,
        apps: user.apps,
        data: user.data,
        mobCode: user.mobCode,
        currentDate: user.currentDate,
        initialDate: user.initialDate,
        payday: user.payday,
        courses: user.courses,
      },
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
        "Te damos la bienvenida al ecosistema kinApp",
        "Tu correo se verificó correctamente"
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
      cellPhone: user.cellPhone,
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
  const { password, id } = req.body;

  const user = await User.findById(id);
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

exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await User.findByIdAndUpdate(
      id,
      {
        mobCode: req.body.mobCode,
        sessionDate: req.body.sessionDate,
        roles: req.body.roles,
        verified: req.body.verified,
        courses: req.body.courses,
      },
      { new: true }
    );
    res.json({ success: true, updatedUser: result });
  } catch (error) {
    console.log(error);
  }
};

exports.creteUserCourses = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await User.findByIdAndUpdate(
      id,
      {
        $push: { courses: { $each: req.body.courses } },
      },
      { new: true }
    );
    res.json({ success: true, createdUserCourse: result });
  } catch (error) {
    console.log(error);
  }
};
exports.updateUserCourses = async (req, res) => {
  try {
    const response = await User.updateOne(
      { _id: req.params.id, "courses.id": req.body.id },
      {
        $set: {
          "courses.$.name": req.body.name,
          "courses.$.state": req.body.state,
          "courses.$.duration": req.body.duration,
          "courses.$.initialDay": req.body.initialDay,
          "courses.$.finalDay": req.body.finalDay,
          "courses.$.score": req.body.score,
        },
      }
    );
    res.json({ success: true, updatedUserCourse: response });
  } catch (error) {
    console.log(error);
  }
};

exports.getUser = async (request, response) => {
  const { id } = request.params;
  try {
    const user = await User.findById(id).populate("clients").populate("motion");

    if (user) {
      response.json({
        success: true,
        user,
      });
    }
    if (!user) {
      console.log(error.message);
      response.status(400).end();
    }
  } catch (error) {
    console.log(error.message);
    response.status(400).end();
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const result = await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, result });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
};
