const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = Number(process.env.SMTP_PORT || 587);
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const SMTP_SECURE = String(process.env.SMTP_SECURE || SMTP_PORT === 465);
const MAIL_FROM = process.env.MAIL_FROM || SMTP_USER;

function ensureMailerConfig() {
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    throw new Error('Missing SMTP config. Please set SMTP_HOST, SMTP_USER, SMTP_PASS in .env');
  }
  if (!MAIL_FROM) {
    throw new Error('Missing MAIL_FROM or SMTP_USER in .env');
  }
}

function getTransporter() {
  ensureMailerConfig();
  let nodemailer;
  try {
    nodemailer = require('nodemailer');
  } catch (err) {
    throw new Error('Nodemailer is not installed. Run: npm install nodemailer');
  }
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_SECURE === 'true',
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS
    }
  });
}

function buildOtpEmail({ code, purpose, expiresAt }) {
  const expiryMinutes = Math.max(1, Math.round((expiresAt.getTime() - Date.now()) / 60000));
  const title = purpose === 'reset' ? 'Khôi phục mật khẩu' : 'Xác thực đăng ký';
  const action = purpose === 'reset'
    ? 'Dùng mã OTP này để đặt lại mật khẩu'
    : 'Dùng mã OTP này để hoàn tất đăng ký';

  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#1f2937">
      <h2 style="margin:0 0 12px 0;">${title}</h2>
      <p>${action}.</p>
      <p style="font-size:20px;letter-spacing:4px;font-weight:700;color:#111827;">${code}</p>
      <p>Mã OTP hết hạn sau ${expiryMinutes} phút.</p>
      <p>Nếu bạn không yêu cầu, hãy bỏ qua email này.</p>
    </div>
  `;

  const text = `${title}\n${action}.\nOTP: ${code}\nMã OTP hết hạn sau ${expiryMinutes} phút.\nNếu bạn không yêu cầu, hãy bỏ qua email này.`;
  return { subject: `[VinhUni] ${title} - Mã OTP`, html, text };
}

async function sendOtpEmail({ to, code, purpose, expiresAt }) {
  const transporter = getTransporter();
  const { subject, html, text } = buildOtpEmail({ code, purpose, expiresAt });
  return transporter.sendMail({
    from: MAIL_FROM,
    to,
    subject,
    text,
    html
  });
}

module.exports = { sendOtpEmail };
