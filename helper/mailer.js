const nodemailer = require("nodemailer");
try {
  exports.transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: "kinappbiomechanics@gmail.com",
      pass: "xzdsgvjddyskzecu",
    },
  });
} catch (error) {
  console.log(error);
}
