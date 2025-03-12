const bcrypt = require("bcrypt");
const Admin = require("../models/admin");
const VerificationToken = require("../models/verificationToken");
const {
  generateOtp,
  generateEmailTemplate,
  plainEmailTemplate,
  generatePasswordResetTemplate,
} = require("../helper/mail");
const { transporter } = require("../helper/mailer");
const ResetAdminToken = require("../models/resetAdminToken");
const { createRandomBytes } = require("../helper/crypto");
exports.getAllAdmins = async (request, response) => {
  try {
    // Buscar todos los administradores en la base de datos
    const admins = await Admin.find({}).select("-password"); // Excluir el campo "password"

    // Retornar la lista de administradores
    response.status(200).json({
      success: true,
      admins,
    });
  } catch (error) {
    console.log("Error fetching admins:", error);
    response.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
exports.getAdminById = async (request, response) => {
  const { id } = request.params; // Obtener el ID del parámetro de la ruta

  try {
    // Buscar el administrador por su ID
    const admin = await Admin.findById(id).select("-password"); // Excluir el campo "password"

    // Si no se encuentra el administrador, retornar un error
    if (!admin) {
      return response.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    // Retornar la información del administrador
    response.status(200).json({
      success: true,
      admin,
    });
  } catch (error) {
    console.log("Error fetching admin by ID:", error);
    response.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

exports.createAdmin = async (request, response) => {
  const {
    userName,
    email,
    cellPhone,
    password,
    roles,
    permissions,
    isSuperAdmin,
  } = request.body;

  try {
    // Verificar si el correo electrónico ya está en uso
    const adminEmail = await Admin.findOne({ email });

    if (adminEmail) {
      return response.status(400).json({
        success: false,
        message: "This email is already in use, try signing in.",
      });
    }

    // Hashear la contraseña
    const passwordHash = await bcrypt.hash(password, 8);

    // Crear el administrador
    const admin = new Admin({
      userName,
      email,
      cellPhone,
      password: passwordHash,
      roles: roles || "admin", // Rol por defecto: "admin"
      permissions: permissions || {
        manageUsers: true,
        manageClients: true,
        manageCourses: true,
        manageAppointments: true,
      },
      isSuperAdmin: isSuperAdmin || false, // Por defecto: false
    });

    // Generar OTP y token de verificación
    const OTP = generateOtp();
    const verificationToken = new VerificationToken({
      owner: admin._id,
      token: OTP,
    });

    // Guardar el token de verificación
    await verificationToken.save();

    // Enviar correo electrónico de verificación
    try {
      await transporter.sendMail({
        from: "kinappbiomechanics@gmail.com", // Dirección del remitente
        to: admin.email, // Correo del administrador
        subject: "Verify your email account", // Asunto del correo
        html: generateEmailTemplate(OTP), // Plantilla del correo
      });
    } catch (error) {
      console.log("Error sending email:", error);
    }

    // Guardar el administrador en la base de datos
    await admin.save();

    // Retornar la respuesta sin la contraseña
    const adminResponse = {
      userName: admin.userName,
      email: admin.email,
      cellPhone: admin.cellPhone,
      id: admin._id,
      avatar: admin.avatar || "",
      verified: admin.verified,
      roles: admin.roles,
      permissions: admin.permissions,
      isSuperAdmin: admin.isSuperAdmin,
      apps: admin.apps,
      data: admin.data,
      mobCode: admin.mobCode,
      courses: admin.courses,
      currentDate: admin.currentDate,
      initialDate: admin.initialDate,
      payday: admin.payday,
      motionId: admin.motionId,
      clientId: admin.clientId,
      userId: admin.userId,
    };

    response.status(201).json({
      success: true,
      admin: adminResponse,
    });
  } catch (error) {
    console.log("Error creating admin:", error);
    response.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

exports.updateAdmin = async (request, response) => {
  const { id } = request.params;
  const updates = request.body;

  try {
    const admin = await Admin.findById(id);

    if (!admin) {
      return response.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    if (updates.password) {
      delete updates.password;
    }

    const updatedAdmin = await Admin.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    }).select("-password");

    response.status(200).json({
      success: true,
      admin: updatedAdmin,
    });
  } catch (error) {
    console.log("Error updating admin:", error);
    response.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

exports.resendAdminCode = async (request, response) => {
  const { adminId, email } = request.body;

  // Validar que se proporcionen los parámetros requeridos
  if (!adminId || !email) {
    return response.status(400).json({
      success: false,
      error: "Faltan parámetros requeridos: adminId o email",
    });
  }

  try {
    // Buscar el administrador por adminId
    const admin = await Admin.findById(adminId);
    if (!admin) {
      return response.status(404).json({
        success: false,
        error: "Administrador no encontrado",
      });
    }

    // Verificar si el email coincide con el del administrador
    if (admin.email !== email) {
      return response.status(400).json({
        success: false,
        error:
          "El email proporcionado no coincide con el registrado para este administrador",
      });
    }

    // Eliminar el token anterior si existe
    const existingToken = await VerificationToken.findOne({ owner: admin._id });
    if (existingToken) {
      await VerificationToken.findByIdAndDelete(existingToken._id);
    }

    // Generar nuevo código OTP
    const OTP = generateOtp();

    // Crear y guardar un nuevo token de verificación
    const verificationToken = new VerificationToken({
      owner: admin._id,
      token: OTP,
    });

    await verificationToken.save();

    // Enviar el correo con el código OTP
    try {
      await transporter.sendMail({
        from: "kinappbiomechanics@gmail.com", // Remitente
        to: admin.email, // Correo del administrador
        subject: "Verifica tu cuenta de correo", // Asunto del correo
        html: generateEmailTemplate(OTP), // Plantilla del correo
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
      admin: {
        userName: admin.userName,
        email: admin.email,
        id: admin._id,
        avatar: admin.avatar || "",
        verified: admin.verified,
        roles: admin.roles,
        permissions: admin.permissions,
        isSuperAdmin: admin.isSuperAdmin,
        apps: admin.apps,
        data: admin.data,
        mobCode: admin.mobCode,
        courses: admin.courses,
      },
    });
  } catch (error) {
    console.error("Error en resendAdminCode:", error);
    return response.status(500).json({
      success: false,
      error: "Hubo un error en el servidor. Intenta nuevamente más tarde",
    });
  }
};

exports.signInAdmin = async (request, response) => {
  try {
    const { email, password } = request.body;

    // Validar que se proporcionen el correo electrónico y la contraseña
    if (!email.trim() || !password.trim()) {
      return response.status(400).json({
        success: false,
        message: "Email / password missing",
      });
    }

    // Buscar el administrador por correo electrónico
    const admin = await Admin.findOne({ email });

    // Si no se encuentra el administrador, retornar un error
    if (!admin) {
      return response.status(404).json({
        success: false,
        message: "Admin not found with the given email",
      });
    }

    // Verificar si la contraseña coincide
    const isMatch = await bcrypt.compare(password, admin.password);

    if (!isMatch) {
      return response.status(401).json({
        success: false,
        message: "Password does not match",
      });
    }

    // Generar un token JWT
    const token = jwt.sign({ adminId: admin._id }, process.env.JWT_SECRET, {
      expiresIn: "1d", // El token expira en 1 día
    });

    // Retornar una respuesta exitosa con la información del administrador
    response.json({
      success: true,
      admin: {
        id: admin._id,
        userName: admin.userName,
        email: admin.email,
        cellPhone: admin.cellPhone,
        avatar: admin.avatar || "",
        token,
        roles: admin.roles,
        isSuperAdmin: admin.isSuperAdmin,
        verified: admin.verified,
        permissions: admin.permissions,
        apps: admin.apps,
        data: admin.data,
        mobCode: admin.mobCode,
        currentDate: admin.currentDate,
        initialDate: admin.initialDate,
        payday: admin.payday,
        courses: admin.courses,
      },
    });
  } catch (error) {
    console.error("Error in signInAdmin:", error);
    response.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

exports.verifyEmail = async (req, res) => {
  const { adminId, otp } = req.body;

  // Validar que se proporcionen los parámetros requeridos
  if (!adminId || !otp.trim()) {
    return res.status(401).json({
      success: false,
      message: "Invalid request, missing parameters!",
    });
  }

  // Buscar el administrador por su ID
  const admin = await Admin.findById(adminId);

  if (!admin) {
    return res.status(401).json({
      success: false,
      message: "Sorry, admin not found!",
    });
  }

  // Verificar si el administrador ya está verificado
  if (admin.verified) {
    return res.status(401).json({
      success: false,
      message: "This account is already verified",
    });
  }

  // Buscar el token de verificación
  const token = await VerificationToken.findOne({ owner: admin._id });

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Sorry, admin not found",
    });
  }

  // Comparar el OTP proporcionado con el token almacenado
  const isMatched = await token.compareToken(otp);

  if (!isMatched) {
    return res.status(401).json({
      success: false,
      message: "Please, provide a valid token",
    });
  }

  // Marcar el administrador como verificado
  admin.verified = true;

  // Eliminar el token de verificación
  await VerificationToken.findByIdAndDelete(token._id);

  // Guardar los cambios en el administrador
  await Admin.findByIdAndUpdate(admin._id, admin);

  // Enviar un correo de bienvenida
  try {
    await transporter.sendMail({
      from: "<kinappbiomechanics@gmail.com>", // Remitente
      to: admin.email, // Correo del administrador
      subject: "Welcome email", // Asunto del correo
      html: plainEmailTemplate(
        "Te damos la bienvenida al ecosistema Orkino",
        "Tu correo se verificó correctamente"
      ),
    });
  } catch (error) {
    console.log("Error sending welcome email:", error);
  }

  // Retornar una respuesta exitosa
  res.json({
    success: true,
    message: "Your email is verified",
    admin: {
      userName: admin.userName,
      email: admin.email,
      cellPhone: admin.cellPhone,
      id: admin._id,
      avatar: admin.avatar || "",
    },
  });
};

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      message: "Please, provide a valid email",
    });
  }

  const admin = await Admin.findOne({ email });

  if (!admin) {
    return res.status(404).json({
      success: false,
      message: "Admin not found with the given email",
    });
  }

  const token = await ResetAdminToken.findOne({ owner: admin._id });

  if (token) {
    return res.status(400).json({
      success: false,
      message: "Only after one hour you can request for another token",
    });
  }

  // Generar un token de restablecimiento
  const randomBytes = await createRandomBytes();
  const resetAdminToken = new ResetAdminToken({
    owner: admin._id,
    token: randomBytes,
  });
  await resetAdminToken.save();

  try {
    await transporter.sendMail({
      from: "<kinappbiomechanics@gmail.com>",
      to: admin.email,
      subject: "Password reset",
      html: generatePasswordResetTemplate(
        admin.userName,
        `https://reset-admin-pass.vercel.app/reset-password?token=${randomBytes}&id=${admin._id}`
      ),
    });
  } catch (error) {
    console.log("Error sending reset email:", error);
  }

  // Retornar una respuesta exitosa
  res.json({
    success: true,
    message: "Password reset link is sent to your email",
  });
};

exports.resetPassword = async (req, res) => {
  const { password, id } = req.body;

  const admin = await Admin.findById(id);

  if (!admin) {
    return res.status(404).json({
      success: false,
      message: "Admin not found",
    });
  }

  const isSamePassword = await bcrypt.compare(password.trim(), admin.password);

  if (isSamePassword) {
    return res.status(400).json({
      success: false,
      message: "New password must be different",
    });
  }

  if (password.trim().length < 8 || password.trim().length > 20) {
    return res.status(400).json({
      success: false,
      message: "New password must be 8 to 20 characters long",
    });
  }

  const passwordHash = await bcrypt.hash(password.trim(), 8);

  admin.password = passwordHash;
  await admin.save();

  await ResetAdminToken.findOneAndDelete({ owner: admin._id });

  try {
    await transporter.sendMail({
      from: "<kinappbiomechanics@gmail.com>",
      to: admin.email, // Correo del administrador
      subject: "Password reset successfully", // Asunto del correo
      html: plainEmailTemplate(
        "Password reset successfully",
        "Now you can login with new password"
      ),
    });
  } catch (error) {
    console.log("Error sending confirmation email:", error);
  }

  // Retornar una respuesta exitosa
  res.json({
    success: true,
    message: "Password reset successfully",
  });
};

exports.getAdminProfile = async (request, response) => {
  try {
    if (!request.admin) {
      return response.status(401).json({
        success: false,
        message: "Unauthorized access! Admin not found.",
      });
    }

    response.json({
      success: true,
      admin: {
        userName: request.admin.userName,
        email: request.admin.email,
        cellPhone: request.admin.cellPhone,
        id: request.admin._id,
        verified: request.admin.verified,
        roles: request.admin.roles,
        isSuperAdmin: request.admin.isSuperAdmin,
        permissions: request.admin.permissions,
        initialDate: request.admin.initialDate,
        payday: request.admin.payday,
        currentDate: request.admin.currentDate,
      },
    });
  } catch (error) {
    console.log("Error fetching admin profile:", error);
    response.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
