import nodemailer from "nodemailer";

const DEFAULT_EXPIRY_MINUTES = 10;
const DEFAULT_SUBJECT = "Your Masar verification code";

const otpSubject = (otp) =>
  `${otp} is your Masar verification code`;

const escapeHtml = (value) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

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
      "Email service is not configured. Set EMAIL_USER/EMAIL_PASS/EMAIL_FROM " +
        "(or USER_SEND_EMAIL_SERVICE/PASSWORD_SEND_EMAIL_SERVICE)."
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

function buildTransport(config) {
  const options = config.host
    ? {
        host: config.host,
        port: config.port,
        secure: config.secure,
      }
    : {
        service: config.service,
      };

  options.auth = {
    user: config.user,
    pass: config.pass,
  };

  options.connectionTimeout = 10000;
  options.greetingTimeout = 10000;
  options.socketTimeout = 20000;

  return nodemailer.createTransport(options);
}

function renderOtpEmail({
  name,
  otp,
  expiresInMinutes,
}) {
  const safeName = escapeHtml(name || "there");
  const safeOtp = escapeHtml(otp);

  const minutes =
    Number(expiresInMinutes) || DEFAULT_EXPIRY_MINUTES;

  // Plain text version
  const text = [
    `Hi ${name || "there"},`,
    "",
    "Your Masar verification code is:",
    "",
    otp,
    "",
    "COPY CODE",
    "Select the verification code above and use your device's Copy command.",
    "",
    `This code expires in ${minutes} minutes.`,
    "",
    "Never share this code with anyone.",
    "Masar will never ask for it by phone, chat or email.",
    "",
    "If you did not request a password reset, you can safely ignore this email.",
    "",
    "Masar",
  ].join("\n");

  // HTML version
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="x-apple-disable-message-reformatting">

  <title>Masar verification code</title>

  <style>
    body {
      margin: 0 !important;
      padding: 0 !important;
      width: 100% !important;
      background-color: #000000;
      font-family: Arial, Helvetica, sans-serif;
    }

    table {
      border-collapse: collapse;
    }

    @media only screen and (max-width: 600px) {
      .email-card {
        width: 100% !important;
      }

      .email-padding {
        padding-left: 20px !important;
        padding-right: 20px !important;
      }

      .otp-code {
        font-size: 27px !important;
        letter-spacing: 6px !important;
        padding: 16px 20px !important;
      }
    }
  </style>
</head>

<body style="margin:0;padding:0;background-color:#000000;">

  <!-- Preheader -->
  <div style="
    display:none;
    max-height:0;
    overflow:hidden;
    opacity:0;
    color:#000000;
    font-size:1px;
    line-height:1px;
  ">
    ${safeOtp} is your Masar verification code.
    It expires in ${minutes} minutes.
  </div>

  <!-- Main container -->
  <table
    role="presentation"
    width="100%"
    cellpadding="0"
    cellspacing="0"
    border="0"
    bgcolor="#000000"
    style="width:100%;background-color:#000000;"
  >
    <tr>
      <td align="center" style="padding:30px 15px;">

        <!-- Email card -->
        <table
          role="presentation"
          width="560"
          cellpadding="0"
          cellspacing="0"
          border="0"
          bgcolor="#121212"
          class="email-card"
          style="
            width:100%;
            max-width:560px;
            background-color:#121212;
            border-top:4px solid #F5C542;
            border-radius:14px;
          "
        >

          <!-- Logo -->
          <tr>
            <td
              align="center"
              style="padding:35px 20px 10px;"
            >
              <h1 style="
                margin:0;
                font-family:Arial,Helvetica,sans-serif;
                font-size:32px;
                line-height:40px;
                font-weight:700;
                color:#F5C542;
              ">
                Masar
              </h1>
            </td>
          </tr>

          <!-- Heading -->
          <tr>
            <td
              align="center"
              class="email-padding"
              style="
                padding:20px 35px 0;
                font-family:Arial,Helvetica,sans-serif;
                font-size:24px;
                line-height:32px;
                font-weight:700;
                color:#FFFFFF;
              "
            >
              Your verification code
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td
              align="center"
              class="email-padding"
              style="
                padding:12px 35px 0;
                font-family:Arial,Helvetica,sans-serif;
                font-size:15px;
                line-height:24px;
                color:#B8B8B8;
              "
            >
              Hi ${safeName}, use this one-time code
              to reset your Masar password.
            </td>
          </tr>

          <!-- OTP label -->
          <tr>
            <td
              align="center"
              style="
                padding:28px 20px 10px;
                font-family:Arial,Helvetica,sans-serif;
                font-size:12px;
                line-height:18px;
                font-weight:700;
                letter-spacing:1.5px;
                color:#AAAAAA;
              "
            >
              YOUR VERIFICATION CODE
            </td>
          </tr>

          <!-- OTP code -->
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
                    class="otp-code"
                    style="
                      background-color:#F5C542;
                      padding:18px 35px;
                      border-radius:10px;
                      font-family:'Courier New',monospace;
                      font-size:36px;
                      line-height:44px;
                      font-weight:700;
                      letter-spacing:10px;
                      color:#000000;
                      -webkit-user-select:all;
                      user-select:all;
                    "
                  >
                    ${safeOtp}
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- COPY CODE visual button -->
          <tr>
            <td
              align="center"
              style="padding:22px 20px 0;"
            >

              <table
                role="presentation"
                width="260"
                cellpadding="0"
                cellspacing="0"
                border="0"
                align="center"
                bgcolor="#F5C542"
                style="
                  width:260px;
                  max-width:100%;
                  background-color:#F5C542;
                  border:2px solid #F5C542;
                  border-radius:8px;
                "
              >
                <tr>
                  <td
                    align="center"
                    valign="middle"
                    bgcolor="#F5C542"
                    style="
                      background-color:#F5C542;
                      padding:15px 20px;
                      font-family:Arial,Helvetica,sans-serif;
                      font-size:16px;
                      line-height:22px;
                      font-weight:700;
                      letter-spacing:1px;
                      color:#000000;
                    "
                  >
                    COPY CODE
                  </td>
                </tr>
              </table>

              <div style="
                padding:12px 10px 0;
                font-family:Arial,Helvetica,sans-serif;
                font-size:12px;
                line-height:19px;
                color:#D0D0D0;
                text-align:center;
              ">
                Select the verification code above,
                then use your device's Copy command.
              </div>

            </td>
          </tr>

          <!-- Expiration -->
          <tr>
            <td
              align="center"
              style="
                padding:24px 20px 0;
                font-family:Arial,Helvetica,sans-serif;
                font-size:14px;
                line-height:22px;
                color:#F5C542;
              "
            >
              This code expires in ${minutes} minutes.
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:30px 35px 0;">
              <div style="
                height:1px;
                line-height:1px;
                background-color:#333333;
              ">
                &nbsp;
              </div>
            </td>
          </tr>

          <!-- Security notice -->
          <tr>
            <td
              align="center"
              style="
                padding:25px 30px 35px;
                font-family:Arial,Helvetica,sans-serif;
                font-size:13px;
                line-height:22px;
                color:#999999;
              "
            >
              Never share this code with anyone.
              Masar will never ask for it by phone, chat or email.

              <br><br>

              Didn't request it?
              You can safely ignore this email.
            </td>
          </tr>

        </table>
        <!-- End email card -->

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
                padding:24px 15px 0;
                font-family:Arial,Helvetica,sans-serif;
                font-size:12px;
                line-height:18px;
                color:#777777;
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

  return {
    html,
    text,
  };
}

/**
 * Send a password-reset OTP email.
 */
export const sendEmailService = async ({
  name = "User",
  to,
  subject,
  message,
  expiresInMinutes = DEFAULT_EXPIRY_MINUTES,
}) => {
  if (!to || !message) {
    throw new Error(
      "sendEmailService requires `to` and `message`."
    );
  }

  const config = getMailConfig();

  const transporter = buildTransport(config);

  const { html, text } = renderOtpEmail({
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

    subject: subject || otpSubject(message) || DEFAULT_SUBJECT,

    text,
    html,

    ...(process.env.EMAIL_REPLY_TO
      ? { replyTo: process.env.EMAIL_REPLY_TO }
      : {}),
  });
};

// Exported for testing
export {
  renderOtpEmail,
  otpSubject,
};