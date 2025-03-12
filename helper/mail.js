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
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
      :root {
        --primary-color: #242424;
        --secondary-color: #112240;
        --background-color: #030012;
        --accent-color: #00D8FF;
        --text-color: #dbdbdb;
        --font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;
      }

      body {
        margin: 0;
        padding: 0;
        background-color: var(--background-color);
        font-family: var(--font-family);
        color: var(--text-color);
      }

      .container {
        max-width: 620px;
        margin: 0 auto;
        padding: 20px;
        background: linear-gradient(145deg, var(--secondary-color), var(--primary-color));
        border-radius: 10px;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
      }

      .header {
        text-align: center;
        padding: 20px;
        background: linear-gradient(145deg, var(--accent-color), var(--secondary-color));
        border-radius: 10px 10px 0 0;
      }

      .header h1 {
        margin: 0;
        font-size: 48px;
        color: var(--text-color);
        font-weight: bold;
      }

      .content {
        padding: 20px;
        text-align: center;
        background: var(--primary-color);
        border-radius: 0 0 10px 10px;
      }

      .content h2 {
        font-size: 24px;
        margin: 0 0 20px;
        color: var(--accent-color);
      }

      .content p {
        font-size: 18px;
        line-height: 1.6;
        margin: 0 0 20px;
        color: var(--text-color);
      }

      .code {
        display: inline-block;
        padding: 15px 25px;
        font-size: 28px;
        font-weight: bold;
        background: linear-gradient(145deg, var(--accent-color), var(--secondary-color));
        color: var(--text-color);
        border-radius: 8px;
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
      }

      @media only screen and (max-width: 620px) {
        .header h1 {
          font-size: 36px;
        }

        .content h2 {
          font-size: 20px;
        }

        .content p {
          font-size: 16px;
        }

        .code {
          font-size: 24px;
          padding: 10px 20px;
        }
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>Orkino</h1>
      </div>
      <div class="content">
        <h2>Solo te falta un paso más para completar tu inscripción.</h2>
        <p>Tu código de verificación es:</p>
        <div class="code">${code}</div>
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
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
      :root {
        --primary-color: #242424;
        --secondary-color: #112240;
        --background-color: #030012;
        --accent-color: #00D8FF;
        --text-color: #dbdbdb;
        --font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;
      }

      body {
        margin: 0;
        padding: 0;
        background-color: var(--background-color);
        font-family: var(--font-family);
        color: var(--text-color);
      }

      .container {
        max-width: 620px;
        margin: 0 auto;
        padding: 20px;
        background: linear-gradient(145deg, var(--secondary-color), var(--primary-color));
        border-radius: 10px;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
      }

      .header {
        text-align: center;
        padding: 20px;
        background: linear-gradient(145deg, var(--accent-color), var(--secondary-color));
        border-radius: 10px 10px 0 0;
      }

      .header h1 {
        margin: 0;
        font-size: 48px;
        color: var(--text-color);
        font-weight: bold;
      }

      .content {
        padding: 20px;
        text-align: center;
        background: var(--primary-color);
        border-radius: 0 0 10px 10px;
      }

      .content h1 {
        font-size: 32px;
        margin: 0 0 20px;
        color: var(--accent-color);
      }

      .content p {
        font-size: 18px;
        line-height: 1.6;
        margin: 0;
        color: var(--text-color);
      }

      @media only screen and (max-width: 620px) {
        .header h1 {
          font-size: 36px;
        }

        .content h1 {
          font-size: 24px;
        }

        .content p {
          font-size: 16px;
        }
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>Orkino</h1>
      </div>
      <div class="content">
        <h1>${heading}</h1>
        <p>${message}</p>
      </div>
    </div>
  </body>
  </html>`;
};

exports.generatePasswordResetTemplate = (userName, url) => {
  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
      :root {
        --primary-color: #242424;
        --secondary-color: #112240;
        --background-color: #030012;
        --accent-color: #00D8FF;
        --text-color: #dbdbdb;
        --font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;
      }

      body {
        margin: 0;
        padding: 0;
        background-color: var(--background-color);
        font-family: var(--font-family);
        color: var(--text-color);
      }

      .container {
        max-width: 620px;
        margin: 0 auto;
        padding: 20px;
        background: linear-gradient(145deg, var(--secondary-color), var(--primary-color));
        border-radius: 10px;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
      }

      .header {
        text-align: center;
        padding: 20px;
        background: linear-gradient(145deg, var(--accent-color), var(--secondary-color));
        border-radius: 10px 10px 0 0;
      }

      .header h1 {
        margin: 0;
        font-size: 48px;
        color: var(--text-color);
        font-weight: bold;
      }

      .content {
        padding: 20px;
        text-align: center;
        background: var(--primary-color);
        border-radius: 0 0 10px 10px;
      }

      .content h1 {
        font-size: 24px;
        margin: 0 0 20px;
        color: var(--accent-color);
      }

      .content p {
        font-size: 18px;
        line-height: 1.6;
        margin: 0 0 20px;
        color: var(--text-color);
      }

      .button {
        display: inline-block;
        padding: 15px 30px;
        font-size: 18px;
        font-weight: bold;
        color: var(--text-color);
        background: linear-gradient(145deg, var(--accent-color), var(--secondary-color));
        border-radius: 8px;
        text-decoration: none;
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
        transition: transform 0.2s, box-shadow 0.2s;
      }

      .button:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 15px rgba(0, 0, 0, 0.3);
      }

      @media only screen and (max-width: 620px) {
        .header h1 {
          font-size: 36px;
        }

        .content h1 {
          font-size: 20px;
        }

        .content p {
          font-size: 16px;
        }

        .button {
          font-size: 16px;
          padding: 10px 20px;
        }
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>Orkino</h1>
      </div>
      <div class="content">
        <h1>Hola ${userName},</h1>
        <p>Requeriste recientemente restablecer tu contraseña. Haz clic en el botón de abajo para continuar:</p>
        <a href="${url}" class="button">Restablecer la contraseña</a>
      </div>
    </div>
  </body>
  </html>`;
};
