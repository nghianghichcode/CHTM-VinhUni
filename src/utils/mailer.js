const path = require('path');
const fs = require('fs');

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = Number(process.env.SMTP_PORT || 587);
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const SMTP_SECURE = String(process.env.SMTP_SECURE || SMTP_PORT === 465);
const MAIL_FROM = process.env.MAIL_FROM || SMTP_USER;
const BASE_URL = process.env.BASE_URL || '';
const MAIL_BRAND = process.env.MAIL_BRAND || 'Cứu hộ máy tính';
const MAIL_LOGO_URL = process.env.MAIL_LOGO_URL || (BASE_URL ? `${BASE_URL}/images/logo.jpg` : '');
const MAIL_HERO_URL = process.env.MAIL_HERO_URL || '';
const DEFAULT_LOGO_SVG_PATH = path.join(__dirname, '..', '..', 'public', 'images', 'logo.svg');
const MAIL_SUPPORT_PHONE = process.env.MAIL_SUPPORT_PHONE || '';
const MAIL_SUPPORT_URL = process.env.MAIL_SUPPORT_URL || (BASE_URL ? `${BASE_URL}/rescue/intro` : '');

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

function svgToDataUri(svgContent) {
  const cleaned = svgContent.replace(/\s+/g, ' ').trim();
  return `data:image/svg+xml;utf8,${encodeURIComponent(cleaned)}`;
}

function isPublicHttpsUrl(url) {
  if (!url) return false;
  const lower = url.toLowerCase();
  if (!lower.startsWith('https://')) return false;
  return !(lower.includes('localhost') || lower.includes('127.0.0.1') || lower.includes('0.0.0.0'));
}

function buildOtpEmail({ code, purpose, expiresAt }) {
  const expiryMinutes = Math.max(1, Math.round((expiresAt.getTime() - Date.now()) / 60000));
  const title = purpose === 'reset' ? 'Khôi phục mật khẩu' : 'Xác thực đăng ký';
  const action = purpose === 'reset'
    ? 'Dùng mã OTP này để đặt lại mật khẩu'
    : 'Dùng mã OTP này để hoàn tất đăng ký';
  const footerNote = 'Nếu bạn không yêu cầu, hãy bỏ qua email này hoặc liên hệ đội cứu hộ.';
  let logoSrc = '';
  if (isPublicHttpsUrl(MAIL_LOGO_URL)) {
    logoSrc = MAIL_LOGO_URL;
  } else if (fs.existsSync(DEFAULT_LOGO_SVG_PATH)) {
    try {
      const stat = fs.statSync(DEFAULT_LOGO_SVG_PATH);
      if (stat.size <= 12 * 1024) {
        const svg = fs.readFileSync(DEFAULT_LOGO_SVG_PATH, 'utf8');
        logoSrc = svgToDataUri(svg);
      }
    } catch (err) {
      // ignore and fallback
    }
  }
  if (!logoSrc && MAIL_LOGO_URL) {
    logoSrc = MAIL_LOGO_URL;
  }
  const heroSrc = MAIL_HERO_URL || '';

  const logoBlock = logoSrc
    ? `
      <table role="presentation" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
        <tr>
          <td style="vertical-align:middle;padding-right:10px;">
            <img src="${logoSrc}" alt="${MAIL_BRAND}" width="44" style="display:block;border:0;max-width:44px;" />
          </td>
          <td style="vertical-align:middle;font-size:14px;font-weight:700;color:#111827;letter-spacing:0.2px;">
            ${MAIL_BRAND}
          </td>
        </tr>
      </table>
    `
    : `<div style="font-size:14px;font-weight:700;color:#111827;">${MAIL_BRAND}</div>`;

  const heroBlock = heroSrc
    ? `<img src="${heroSrc}" alt="" width="560" style="display:block;border:0;width:100%;max-width:560px;border-radius:12px;" />`
    : '';

  const supportLine = MAIL_SUPPORT_PHONE
    ? `<div style="margin-top:10px;font-size:13px;color:#6b7280;">Hotline cứu hộ: <strong style="color:#111827;">${MAIL_SUPPORT_PHONE}</strong></div>`
    : '';

  const ctaButton = MAIL_SUPPORT_URL
    ? `
      <div style="margin-top:16px;">
        <a href="${MAIL_SUPPORT_URL}" style="background:#1d4ed8;color:#ffffff;text-decoration:none;padding:10px 16px;border-radius:8px;display:inline-block;font-size:14px;">Liên hệ cứu hộ ngay</a>
      </div>
    `
    : '';

  const html = `
  <div style="background:#eef2ff;padding:24px 0;">
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:collapse;">
      <tr>
        <td align="center">
          <table role="presentation" cellpadding="0" cellspacing="0" width="560" style="border-collapse:collapse;background:#ffffff;border-radius:16px;overflow:hidden;">
            <tr>
              <td style="padding:24px 28px 12px 28px;">
                ${logoBlock}
              </td>
            </tr>
            ${heroBlock ? `
            <tr>
              <td style="padding:0 28px 12px 28px;">
                ${heroBlock}
              </td>
            </tr>
            ` : ''}
            <tr>
              <td style="padding:12px 28px 4px 28px;font-family:Arial,sans-serif;color:#111827;">
                <h2 style="margin:0 0 8px 0;font-size:22px;">${title}</h2>
                <p style="margin:0 0 16px 0;color:#374151;">${action}. Nếu bạn cần hỗ trợ gấp, đội cứu hộ luôn sẵn sàng.</p>
                <div style="background:#eef2ff;border:1px dashed #c7d2fe;border-radius:12px;padding:14px 16px;text-align:center;">
                  <div style="font-size:24px;letter-spacing:6px;font-weight:700;color:#1d4ed8;">${code}</div>
                </div>
                <p style="margin:16px 0 0 0;color:#4b5563;">Mã OTP hết hạn sau <strong>${expiryMinutes} phút</strong>.</p>
                ${ctaButton}
                ${supportLine}
              </td>
            </tr>
            <tr>
              <td style="padding:12px 28px 24px 28px;font-family:Arial,sans-serif;color:#6b7280;font-size:13px;">
                ${footerNote}
              </td>
            </tr>
          </table>
          <div style="font-family:Arial,sans-serif;color:#9ca3af;font-size:12px;padding-top:12px;">
            ${MAIL_BRAND}
          </div>
        </td>
      </tr>
    </table>
  </div>
  `;

  const text = `${title}\n${action}.\nOTP: ${code}\nMã OTP hết hạn sau ${expiryMinutes} phút.\n${footerNote}`;
  return { subject: `[${MAIL_BRAND}] ${title} - Mã OTP`, html, text };
}

async function sendOtpEmail({ to, code, purpose, expiresAt }) {
  console.log('[OTP] Sending OTP email', { to, purpose, host: SMTP_HOST, port: SMTP_PORT, secure: SMTP_SECURE });
  const transporter = getTransporter();
  if (process.env.SMTP_DEBUG === '1') {
    try {
      await transporter.verify();
      console.log('[OTP] SMTP verify ok');
    } catch (err) {
      console.error('[OTP] SMTP verify failed', err?.message || err);
      throw err;
    }
  }
  const { subject, html, text } = buildOtpEmail({ code, purpose, expiresAt });
  const info = await transporter.sendMail({
    from: MAIL_FROM,
    to,
    subject,
    text,
    html
  });
  console.log('[OTP] Email sent', { messageId: info?.messageId });
  return info;
}

module.exports = { sendOtpEmail };
