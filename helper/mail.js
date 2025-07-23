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
        <h1>Baskin</h1>
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
        <h1>Baskin</h1>
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
  <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
  <html xmlns="http://www.w3.org/1999/xhtml">
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Restablecer contraseña - BASKIN</title>
    <style type="text/css">
      /* Base styles */
      body {
        margin: 0;
        padding: 0;
        font-family: Arial, Helvetica, sans-serif;
        color: #333333;
        line-height: 1.4;
        -webkit-text-size-adjust: 100%;
        -ms-text-size-adjust: 100%;
      }
      
      /* Client-specific styles */
      .ExternalClass {
        width: 100%;
      }
      
      .ExternalClass,
      .ExternalClass p,
      .ExternalClass span,
      .ExternalClass font,
      .ExternalClass td,
      .ExternalClass div {
        line-height: 100%;
      }
      
      /* Force Outlook to provide a "view in browser" message */
      #outlook a {
        padding: 0;
      }
      
      /* Force Hotmail to display emails at full width */
      .ReadMsgBody {
        width: 100%;
      }
      
      .ExternalClass {
        width: 100%;
      }
      
      /* Reset styles */
      img {
        border: 0;
        height: auto;
        line-height: 100%;
        outline: none;
        text-decoration: none;
        -ms-interpolation-mode: bicubic;
      }
      
      table {
        border-collapse: collapse;
        mso-table-lspace: 0pt;
        mso-table-rspace: 0pt;
      }
      
      /* Main styles */
      body, #bodyTable {
        background-color: #f5f5f5;
        height: 100% !important;
        margin: 0;
        padding: 0;
        width: 100% !important;
      }
      
      #bodyCell {
        padding: 20px;
      }
      
      .email-container {
        max-width: 600px;
        margin: 0 auto;
        background: #ffffff;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      }
      
      .email-header {
        background: #112240;
        padding: 30px 20px;
        text-align: center;
        color: #ffffff;
      }
      
      .email-header h1 {
        margin: 0;
        font-size: 28px;
        font-weight: bold;
        color: #00D8FF;
      }
      
      .email-body {
        padding: 30px 20px;
        color: #333333;
        font-size: 16px;
        line-height: 1.6;
      }
      
      .email-body h2 {
        color: #112240;
        margin-top: 0;
        font-size: 22px;
      }
      
      .email-footer {
        padding: 20px;
        text-align: center;
        font-size: 12px;
        color: #777777;
        background: #f9f9f9;
      }
      
      .button {
        display: inline-block;
        padding: 12px 24px;
        background-color: #00D8FF;
        color: #ffffff !important;
        text-decoration: none;
        font-weight: bold;
        border-radius: 4px;
        margin: 20px 0;
      }
      
      .text-muted {
        color: #777777;
        font-size: 14px;
        margin-top: 30px;
      }
      
      /* Responsive styles */
      @media only screen and (max-width: 600px) {
        .email-container {
          width: 100% !important;
        }
        
        .email-header h1 {
          font-size: 24px !important;
        }
        
        .email-body {
          font-size: 14px !important;
        }
        
        .button {
          padding: 10px 20px !important;
        }
      }
    </style>
  </head>
  <body style="margin: 0; padding: 0;">
    <!--[if (gte mso 9)|(IE)]>
    <table width="600" align="center" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td>
    <![endif]-->
    
    <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse;">
      <tr>
        <td align="center" valign="top" id="bodyCell" style="padding: 20px;">
          <!-- EMAIL CONTAINER -->
          <table border="0" cellpadding="0" cellspacing="0" width="600" class="email-container">
            <!-- HEADER -->
            <tr>
              <td align="center" valign="top" class="email-header">
                <h1 style="margin: 0; font-size: 28px; font-weight: bold; color: #00D8FF;">BASKIN</h1>
              </td>
            </tr>
            
            <!-- BODY -->
            <tr>
              <td valign="top" class="email-body">
                <h2 style="color: #112240; margin-top: 0; font-size: 22px;">Hola ${userName},</h2>
                <p style="margin: 0 0 20px 0;">Requeriste recientemente restablecer tu contraseña. Haz clic en el botón de abajo para continuar:</p>
                
                <div align="center" style="margin: 25px 0;">
                  <!--[if mso]>
                    <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${url}" style="height:44px;v-text-anchor:middle;width:200px;" arcsize="8%" strokecolor="#00D8FF" fillcolor="#00D8FF">
                      <w:anchorlock/>
                      <center style="color:#ffffff;font-family:Arial,Helvetica,sans-serif;font-size:16px;font-weight:bold;">Restablecer contraseña</center>
                    </v:roundrect>
                  <![endif]-->
                  <a href="${url}" class="button" style="display: inline-block; padding: 12px 24px; background-color: #00D8FF; color: #ffffff !important; text-decoration: none; font-weight: bold; border-radius: 4px;">Restablecer contraseña</a>
                </div>
                
                <p style="margin: 0 0 20px 0;">Si no solicitaste un restablecimiento de contraseña, ignora este mensaje o contáctanos si tienes alguna duda.</p>
                
                <p class="text-muted" style="color: #777777; font-size: 14px; margin-top: 30px;">Este enlace expirará en 24 horas por motivos de seguridad.</p>
              </td>
            </tr>
            
            <!-- FOOTER -->
            <tr>
              <td valign="top" class="email-footer">
                <p style="margin: 0;">© 2025 BASKIN. Todos los derechos reservados.</p>
                <p style="margin: 10px 0 0 0;">Tecnología de evaluación del movimiento</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    
    <!--[if (gte mso 9)|(IE)]>
        </td>
      </tr>
    </table>
    <![endif]-->
  </body>
  </html>`;
};
