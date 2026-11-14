
import nodemailer from "nodemailer";

const DEFAULT_EXPIRY_MINUTES = 10;
const DEFAULT_SUBJECT = "Your Masar password reset code";

/* --------------------------------
   Helpers
--------------------------------- */

const escapeHtml = (value) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const otpSubject = () => DEFAULT_SUBJECT;

function getMailConfig() {
  const host = (process.env.EMAIL_HOST || "").trim();

  const service =
    (process.env.EMAIL_SERVICE || "").trim() ||
    (host ? "" : "gmail");

  const user = (
    process.env.EMAIL_USER ||
    process.env.USER_SEND_EMAIL_SERVICE ||
    ""
  ).trim();

  const pass =
    process.env.EMAIL_PASS ||
    process.env.PASSWORD_SEND_EMAIL_SERVICE ||
    "";

  const from = (process.env.EMAIL_FROM || user).trim();

  const fromName = (
    process.env.EMAIL_FROM_NAME || "Masar"
  ).trim();

  const port = Number(process.env.EMAIL_PORT || 587);

  const secure =
    String(process.env.EMAIL_SECURE || "").toLowerCase() === "true";

  if (!user || !pass || !from) {
    throw new Error(
      "Email service is not configured. Set EMAIL_USER, EMAIL_PASS and EMAIL_FROM."
    );
  }

  if (!host && !service) {
    throw new Error(
      "Email service requires EMAIL_HOST or EMAIL_SERVICE."
    );
  }

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("EMAIL_PORT must be a valid TCP port.");
  }

  return {
    host,
    service,
    user,
    pass,
    from,
    fromName,
    port,
    secure,
  };
}

/* --------------------------------
   Mail Transport
--------------------------------- */

function createTransporter(config) {
  const transportOptions = config.host
    ? {
        host: config.host,
        port: config.port,
        secure: config.secure,
      }
    : {
        service: config.service,
      };

  return nodemailer.createTransport({
    ...transportOptions,

    auth: {
      user: config.user,
      pass: config.pass,
    },

    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 20000,
  });
}

/* --------------------------------
   Plain Text Template
--------------------------------- */

function buildTextEmail({ name, otp, minutes }) {
  return [
    `Hello ${name},`,
    "",
    "Your Masar password reset verification code is:",
    "",
    otp,
    "",
    `This code expires in ${minutes} minutes.`,
    "",
    "Enter this code on the password reset page to continue.",
    "",
    "Security notice:",
    "Never share this code with anyone.",
    "Masar will never ask for your verification code by phone, chat or email.",
    "",
    "If you did not request a password reset, you can safely ignore this email.",
    "",
    "Masar",
  ].join("\n");
}

/* --------------------------------
   HTML Email Template
--------------------------------- */

function buildHtmlEmail({ name, otp, minutes }) {
  const safeName = escapeHtml(name);
  const safeOtp = escapeHtml(otp);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="x-apple-disable-message-reformatting">
  <title>Masar Password Reset</title>
</head>

<body style="
  margin:0;
  padding:0;
  background-color:#0B0B0B;
  font-family:Arial,Helvetica,sans-serif;
">

  <table
    role="presentation"
    width="100%"
    cellpadding="0"
    cellspacing="0"
    border="0"
    bgcolor="#0B0B0B"
    style="background-color:#0B0B0B;width:100%;"
  >
    <tr>
      <td align="center" style="padding:30px 15px;">

        <!-- Main Card -->
        <table
          role="presentation"
          width="560"
          cellpadding="0"
          cellspacing="0"
          border="0"
          bgcolor="#171717"
          style="
            width:100%;
            max-width:560px;
            background-color:#171717;
            border-radius:14px;
            border-top:4px solid #F5C542;
          "
        >

          <!-- Brand -->
          <tr>
            <td align="center" style="padding:35px 20px 10px;">
              <h1 style="
                margin:0;
                color:#F5C542;
                font-size:32px;
                line-height:40px;
                font-weight:700;
              ">
                Masar
              </h1>
            </td>
          </tr>

          <!-- Heading -->
          <tr>
            <td
              align="center"
              style="
                padding:20px 25px 0;
                color:#FFFFFF;
                font-size:24px;
                line-height:32px;
                font-weight:700;
              "
            >
              Password Reset
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td
              align="center"
              style="
                padding:15px 30px 0;
                color:#CCCCCC;
                font-size:15px;
                line-height:24px;
              "
            >
              Hello ${safeName},
              <br>
              Use the verification code below to reset your password.
            </td>
          </tr>

          <!-- OTP Label -->
          <tr>
            <td
              align="center"
              style="
                padding:30px 20px 10px;
                color:#AAAAAA;
                font-size:12px;
                line-height:18px;
                font-weight:700;
                letter-spacing:1.5px;
              "
            >
              YOUR VERIFICATION CODE
            </td>
          </tr>

          <!-- OTP: Keep this as selectable text -->
          <tr>
            <td align="center" style="padding:8px 15px 0;">
              <table
                role="presentation"
                cellpadding="0"
                cellspacing="0"
                border="0"
                align="center"
              >
                <tr>
                  <td
                    align="center"
                    bgcolor="#F5C542"
                    style="
                      background-color:#F5C542;
                      padding:18px 30px;
                      border-radius:10px;
                      color:#000000;
                      font-family:'Courier New',monospace;
                      font-size:34px;
                      line-height:42px;
                      font-weight:700;
                      letter-spacing:8px;
                    "
                  >
                    ${safeOtp}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Expiration -->
          <tr>
            <td
              align="center"
              style="
                padding:25px 20px 0;
                color:#F5C542;
                font-size:14px;
                line-height:22px;
              "
            >
              This code expires in ${minutes} minutes.
            </td>
          </tr>

          <!-- Instructions -->
          <tr>
            <td
              align="center"
              style="
                padding:15px 30px 0;
                color:#CCCCCC;
                font-size:14px;
                line-height:23px;
              "
            >
              Enter this code on the password reset page to continue.
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:30px 35px 0;">
              <table
                role="presentation"
                width="100%"
                cellpadding="0"
                cellspacing="0"
                border="0"
              >
                <tr>
                  <td
                    height="1"
                    bgcolor="#333333"
                    style="height:1px;background-color:#333333;"
                  ></td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Security Notice -->
          <tr>
            <td
              align="center"
              style="
                padding:25px 30px 35px;
                color:#999999;
                font-size:13px;
                line-height:22px;
              "
            >
              <strong style="color:#CCCCCC;">
                Security notice
              </strong>

              <br><br>

              Never share this code with anyone.
              Masar will never ask for your verification code
              by phone, chat or email.

              <br><br>

              If you did not request a password reset,
              you can safely ignore this email.
            </td>
          </tr>

        </table>
        <!-- End Main Card -->

        <!-- Footer -->
        <table
          role="presentation"
          width="560"
          cellpadding="0"
          cellspacing="0"
          border="0"
          style="width:100%;max-width:560px;"
        >
          <tr>
            <td
              align="center"
              style="
                padding:25px 15px 0;
                color:#777777;
                font-size:12px;
                line-height:18px;
              "
            >
              Masar. All rights reserved.
            </td>
          </tr>
        </table>

      </td>
    </tr>
  </table>

</body>
</html>`;
}

/* --------------------------------
   Email Renderer
--------------------------------- */

function renderOtpEmail({
  name,
  otp,
  expiresInMinutes = DEFAULT_EXPIRY_MINUTES,
}) {
  const safeName = String(name || "there");
  const safeOtp = String(otp ?? "");

  const parsedMinutes = Number(expiresInMinutes);

  const minutes =
    Number.isFinite(parsedMinutes) && parsedMinutes > 0
      ? parsedMinutes
      : DEFAULT_EXPIRY_MINUTES;

  return {
    subject: otpSubject(),
    text: buildTextEmail({
      name: safeName,
      otp: safeOtp,
      minutes,
    }),
    html: buildHtmlEmail({
      name: safeName,
      otp: safeOtp,
      minutes,
    }),
  };
}

/* --------------------------------
   Send Email Service
--------------------------------- */

export const sendEmailService = async ({
  name = "User",
  to,
  subject,
  message,
  expiresInMinutes = DEFAULT_EXPIRY_MINUTES,
}) => {
  if (!to || !message) {
    throw new Error(
      "sendEmailService requires both `to` and `message`."
    );
  }

  const config = getMailConfig();
  const transporter = createTransporter(config);

  const email = renderOtpEmail({
    name,
    otp: message,
    expiresInMinutes,
  });

  const from = config.from.includes("<")
    ? config.from
    : `${config.fromName} <${config.from}>`;

  return transporter.sendMail({
    from,
    to,
    subject: subject || email.subject,
    text: email.text,
    html: email.html,

    ...(process.env.EMAIL_REPLY_TO
      ? { replyTo: process.env.EMAIL_REPLY_TO }
      : {}),
  });
};

/* --------------------------------
   Exports
--------------------------------- */

export {
  renderOtpEmail,
  otpSubject,
};
