import nodemailer from "nodemailer";

// Password-reset emails are OTP based (the storefront expects a code, not a
// link). The HTML mirrors the Masar dark theme used by the reference project,
// but every value is rendered per message: no hardcoded code, no shared state.

const DEFAULT_EXPIRY_MINUTES = 10;
const DEFAULT_SUBJECT = "Your Masar password reset code";

const escapeHtml = (value) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

function getMailConfig() {
  const host = (process.env.EMAIL_HOST || "").trim();
  // `EMAIL_SERVICE` only applies when no custom host is given. If a host is
  // provided we use explicit host/port/secure (works with MailHog, SES, etc.).
  const service = (process.env.EMAIL_SERVICE || "").trim() || (host ? "" : "gmail");
  const user = (
    process.env.EMAIL_USER ||
    process.env.USER_SEND_EMAIL_SERVICE ||
    ""
  ).trim();
  const pass = process.env.EMAIL_PASS || process.env.PASSWORD_SEND_EMAIL_SERVICE || "";
  const from = (process.env.EMAIL_FROM || user).trim();
  const fromName = (process.env.EMAIL_FROM_NAME || "Masar").trim();
  const port = Number(process.env.EMAIL_PORT || 587);
  const secure = String(process.env.EMAIL_SECURE || "").toLowerCase() === "true";

  if (!user || !pass || !from) {
    throw new Error(
      "Email service is not configured. Set EMAIL_USER/EMAIL_PASS/EMAIL_FROM " +
        "(or USER_SEND_EMAIL_SERVICE/PASSWORD_SEND_EMAIL_SERVICE)."
    );
  }

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("EMAIL_PORT must be a valid TCP port.");
  }

  return { host, service, user, pass, from, fromName, port, secure };
}

function buildTransport(config) {
  // For well-known services (Gmail) let nodemailer pick host/port/secure.
  // For an explicit host use the configured port + TLS flag.
  const options = config.host
    ? { host: config.host, port: config.port, secure: config.secure }
    : { service: config.service };

  options.auth = { user: config.user, pass: config.pass };
  options.connectionTimeout = 10000;
  options.greetingTimeout = 10000;
  options.socketTimeout = 20000;

  return nodemailer.createTransport(options);
}

function renderOtpEmail({ name, otp, expiresInMinutes }) {
  const safeName = escapeHtml(name || "there");
  const safeOtp = escapeHtml(otp);
  const minutes = Number(expiresInMinutes) || DEFAULT_EXPIRY_MINUTES;

  const text = [
    `Hi ${name || "there"},`,
    "",
    "Use this code to reset your Masar password:",
    "",
    `Verification code: ${otp}`,
    "",
    `This code expires in ${minutes} minutes.`,
    "Never share this code with anyone. Masar will never ask for it by phone, chat or email.",
    "If you did not request a password reset, you can safely ignore this email.",
    "",
    "Masar",
  ].join("\n");

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="dark">
<meta name="supported-color-schemes" content="dark">
<title>Your Masar password reset code</title>
</head>
<body style="margin:0;padding:0;background-color:#000000;">
<!-- Preheader (inbox preview text) -->
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:#000000;font-size:1px;line-height:1px;">
Your Masar password reset code is ${safeOtp}. It expires in ${minutes} minutes.
</div>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#000000;">
<tr><td align="center" style="padding:32px 16px;">

  <table role="presentation" width="560" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:560px;background-color:#121212;border-radius:16px;border-top:4px solid #F5C542;">

    <!-- Logo -->
    <tr><td align="center" style="padding:40px 32px 8px 32px;">
      <h1 style="margin:0;padding:0;font-size:32px;line-height:40px;font-weight:700;color:#f5c443;">Masar</h1>
    </td></tr>

    <!-- Heading -->
    <tr><td align="center" style="padding:24px 40px 0 40px;font-family:'Segoe UI',Helvetica,Arial,sans-serif;font-size:24px;line-height:32px;font-weight:700;color:#FFFFFF;">
      Reset your password
    </td></tr>

    <!-- Intro -->
    <tr><td align="center" style="padding:12px 40px 0 40px;font-family:'Segoe UI',Helvetica,Arial,sans-serif;font-size:15px;line-height:24px;color:#B8B8B8;">
      Hi ${safeName}, enter this code in Masar to choose a new password.
    </td></tr>

    <!-- OTP -->
    <tr><td align="center" style="padding:28px 40px 0 40px;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0">
        <tr><td align="center" style="background-color:#F5C542;border-radius:12px;padding:18px 36px;font-family:'Courier New',Consolas,monospace;font-size:38px;line-height:44px;font-weight:700;letter-spacing:12px;color:#000000;">
          ${safeOtp}
        </td></tr>
      </table>
    </td></tr>

    <!-- Expiry -->
    <tr><td align="center" style="padding:20px 40px 0 40px;font-family:'Segoe UI',Helvetica,Arial,sans-serif;font-size:14px;line-height:22px;color:#F5C542;">
      This code expires in ${minutes} minutes.
    </td></tr>

    <!-- Divider -->
    <tr><td style="padding:32px 40px 0 40px;"><div style="height:1px;line-height:1px;background-color:#2A2A2A;">&nbsp;</div></td></tr>

    <!-- Security note -->
    <tr><td align="center" style="padding:24px 40px 40px 40px;font-family:'Segoe UI',Helvetica,Arial,sans-serif;font-size:13px;line-height:21px;color:#8A8A8A;">
      Never share this code with anyone. Masar will never ask for it by phone, chat or email.<br>
      Didn&rsquo;t request it? You can safely ignore this email.
    </td></tr>
  </table>

  <!-- Footer -->
  <table role="presentation" width="560" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:560px;">
    <tr><td align="center" style="padding:24px 16px 0 16px;font-family:'Segoe UI',Helvetica,Arial,sans-serif;font-size:12px;line-height:18px;color:#6B6B6B;">
      Masar. All rights reserved.<br>
      <a href="#" style="color:#F5C542;text-decoration:none;">Help center</a>
    </td></tr>
  </table>

</td></tr>
</table>
</body>
</html>`;

  return { html, text };
}

/**
 * Send a password-reset OTP email.
 *
 * The function resolves only after the SMTP server accepts the message, so
 * callers can return an error instead of a misleading success response when
 * delivery fails. OTPs/tokens are never logged.
 *
 * @param {object} options
 * @param {string} options.to Recipient email address.
 * @param {string} [options.name] Recipient display name.
 * @param {string} [options.subject] Email subject.
 * @param {string} options.message The OTP shown to the user.
 * @param {number} [options.expiresInMinutes] Expiry shown in the email.
 */
export const sendEmailService = async ({
  name = "User",
  to,
  subject = DEFAULT_SUBJECT,
  message,
  expiresInMinutes = DEFAULT_EXPIRY_MINUTES,
}) => {
  if (!to || !message) {
    throw new Error("sendEmailService requires `to` and `message`.");
  }

  const config = getMailConfig();
  const transporter = buildTransport(config);
  const { html, text } = renderOtpEmail({ name, otp: message, expiresInMinutes });
  const from = config.from.includes("<")
    ? config.from
    : `${config.fromName} <${config.from}>`;

  return transporter.sendMail({
    from,
    to,
    subject,
    text,
    html,
    ...(process.env.EMAIL_REPLY_TO ? { replyTo: process.env.EMAIL_REPLY_TO } : {}),
  });
};
