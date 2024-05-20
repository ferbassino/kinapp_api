//One-time password (OTP) systems provide a mechanism for logging on to a network or service using a unique password that can only be used once, as the name suggests.

const nodemailer = require("nodemailer");

exports.generateOtp = () => {
  let otp = "";
  for (let i = 0; i <= 3; i++) {
    const randVal = Math.round(Math.random() * 9);
    otp = otp + randVal;
  }
  return otp;
};

exports.mailTransport = () =>
  nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: process.env.MAILTRAP_USERNAME,
      pass: process.env.MAILTRAP_PASSWORD,
    },
  });

exports.generateEmailTemplate = (code) => {
  return `
   <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <style>

    @media only screen and (max-width:620px){
        h1{
        font-size: 20px;
        padding:5px
        }
    }
    </style>
  </head>
  <body>
    <div>
        <div style="max-width:620px; margin:0 auto; font-family: Arial, Helvetica, sans-serif; color: #0f0c2e;">
            <h1 style="background: #e27560;padding:10px ;text-align: center; color: #0f0c2e;font-size: 60px;">kinApp</h1>
            
            <h2 style="background: #f6f6f6;padding:10px ;text-align: center; color: #0f0c2e;">Solo te falta un paso más para completar tu inscripción.</h2>
            <p>Tu código de verificación es:</p>
            <p style="width: 80px; margin: 0 auto; font-weight: bold; text-align: center; background: #f6f6f6; border-radius: 5px; font-size: 25px;">${code}</p>
        </div>
    </div>
    
  </body>
  </html>`;
};
exports.plainEmailTemplate = (heading, message) => {
  return `
   <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <style>

    @media only screen and (max-width:620px){
        h1{
        font-size: 20px;
        padding:5px
        }
    }
    </style>
  </head>
  <body>
    <div>
        <div style="max-width:620px; margin:0 auto; font-family: Arial, Helvetica, sans-serif; color: #0f0c2e;">
            <h1 style="background: #e27560;padding:10px ;text-align: center; color: #0f0c2e;font-size: 60px;">kinApp</h1>
            <h1 style="background: #f6f6f6;padding:10px ;text-align: center; color: #0f0c2e;">${heading}</h1>
            <p style="max-width:500px; margin: 0 auto; font-weight: bold; text-align: center; background: #f6f6f6; border-radius: 5px; font-size: 25px;">${message}</p>
        </div>
    </div>
    
  </body>
  </html>`;
};

exports.generatePasswordResetTemplate = (userName, url) => {
  return `<!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <style>

    @media only screen and (max-width:620px){
        h1{
        font-size: 20px;
        padding:5px
        }
    }
    </style>
  </head>
  <body>
    <div>
        <div style="max-width:620px; margin:0 auto; font-family: Arial, Helvetica, sans-serif; color: #0f0c2e;">
            <h1 style="background: #e27560;padding:10px ;text-align: center; color: #0f0c2e;font-size: 60px;">kinApp</h1>
            <h1 style="background: #f6f6f6;padding:10px ;text-align: center; color: #0f0c2e;">Hola ${userName},</h1>
            <p>Requeriste recientemente reestablecer tu contraseña, haz clik en el enlace de abajo resetearla. </p>
            <a href="${url}" style="max-width:500px; margin: 0 auto; font-weight: bold; text-align: center; background: #f6f6f6; border-radius: 5px; font-size: 25px;">Reestablecer la contraseña</a>
        </div>
    </div>
    
  </body>
  </html>`;
};
