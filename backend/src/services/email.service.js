import transporter from "../config/nodemailer.js";

// ── Shared helpers ────────────────────────────────────────────────────────────

const FROM_ADDRESS = `"ScrapBridge" <${process.env.EMAIL_USER}>`;

// ── sendVerificationEmail ─────────────────────────────────────────────────────

/**
 * Send an account-verification email to a newly registered user.
 *
 * @param {{ name: string, email: string }} user
 * @param {string} token  - UUID verification token stored on the user record
 */
export const sendVerificationEmail = async (user, token) => {
  const verifyUrl = `${process.env.CLIENT_URL}/verify-email?token=${token}`;

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
      <title>Verify Your Email — ScrapBridge</title>
      <style>
        body { margin: 0; padding: 0; background: #f4f6f8; font-family: 'Segoe UI', Arial, sans-serif; }
        .wrapper { max-width: 560px; margin: 40px auto; background: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.08); }
        .header { background: #1A7A4A; padding: 36px 40px; text-align: center; }
        .header h1 { margin: 0; color: #ffffff; font-size: 26px; letter-spacing: 0.5px; }
        .body { padding: 36px 40px; }
        .body p { color: #444; font-size: 15px; line-height: 1.7; margin: 0 0 18px; }
        .btn-wrap { text-align: center; margin: 32px 0; }
        .btn { display: inline-block; padding: 14px 36px; background: #1A7A4A; color: #ffffff !important; text-decoration: none; border-radius: 6px; font-size: 15px; font-weight: 600; letter-spacing: 0.3px; }
        .fallback { word-break: break-all; color: #1A7A4A; font-size: 13px; }
        .footer { background: #f4f6f8; padding: 20px 40px; text-align: center; color: #999; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="header">
          <h1>ScrapBridge</h1>
        </div>
        <div class="body">
          <p>Hi <strong>${user.name}</strong>,</p>
          <p>Welcome aboard! Please verify your email address to activate your ScrapBridge account. Click the button below — the link is valid for <strong>24 hours</strong>.</p>
          <div class="btn-wrap">
            <a href="${verifyUrl}" class="btn">Verify My Email</a>
          </div>
          <p>If the button doesn't work, copy and paste this link into your browser:</p>
          <p class="fallback">${verifyUrl}</p>
          <p>If you didn't create a ScrapBridge account, you can safely ignore this email.</p>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} ScrapBridge. All rights reserved.
        </div>
      </div>
    </body>
    </html>
  `;

  await transporter.sendMail({
    from: FROM_ADDRESS,
    to: user.email,
    subject: "Verify Your Email — ScrapBridge",
    html,
  });
};

// ── sendPasswordResetEmail ────────────────────────────────────────────────────

/**
 * Send a password-reset email.
 *
 * @param {{ name: string, email: string }} user
 * @param {string} token  - UUID reset token stored on the user record
 */
export const sendPasswordResetEmail = async (user, token) => {
  const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${token}`;

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
      <title>Reset Your Password — ScrapBridge</title>
      <style>
        body { margin: 0; padding: 0; background: #f4f6f8; font-family: 'Segoe UI', Arial, sans-serif; }
        .wrapper { max-width: 560px; margin: 40px auto; background: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.08); }
        .header { background: #D97706; padding: 36px 40px; text-align: center; }
        .header h1 { margin: 0; color: #ffffff; font-size: 26px; letter-spacing: 0.5px; }
        .body { padding: 36px 40px; }
        .body p { color: #444; font-size: 15px; line-height: 1.7; margin: 0 0 18px; }
        .btn-wrap { text-align: center; margin: 32px 0; }
        .btn { display: inline-block; padding: 14px 36px; background: #D97706; color: #ffffff !important; text-decoration: none; border-radius: 6px; font-size: 15px; font-weight: 600; letter-spacing: 0.3px; }
        .warning { background: #FEF3C7; border-left: 4px solid #D97706; padding: 12px 16px; border-radius: 4px; color: #92400E; font-size: 13px; margin-bottom: 18px; }
        .fallback { word-break: break-all; color: #D97706; font-size: 13px; }
        .footer { background: #f4f6f8; padding: 20px 40px; text-align: center; color: #999; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="header">
          <h1>ScrapBridge</h1>
        </div>
        <div class="body">
          <p>Hi <strong>${user.name}</strong>,</p>
          <p>We received a request to reset your ScrapBridge password. Click the button below to choose a new password.</p>
          <div class="warning">
            ⚠️ This link will expire in <strong>1 hour</strong>. After that, you'll need to request a new reset link.
          </div>
          <div class="btn-wrap">
            <a href="${resetUrl}" class="btn">Reset My Password</a>
          </div>
          <p>If the button doesn't work, copy and paste this link into your browser:</p>
          <p class="fallback">${resetUrl}</p>
          <p>If you did not request a password reset, you can safely ignore this email. Your password will not change.</p>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} ScrapBridge. All rights reserved.
        </div>
      </div>
    </body>
    </html>
  `;

  await transporter.sendMail({
    from: FROM_ADDRESS,
    to: user.email,
    subject: "Reset Your Password — ScrapBridge",
    html,
  });
};

// ── sendPickupNotificationEmail ───────────────────────────────────────────────

/**
 * Send a generic pickup notification email to a user.
 *
 * @param {{ name: string, email: string }} user
 * @param {string} message  - Notification body text
 */
export const sendPickupNotificationEmail = async (user, message) => {
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
      <title>ScrapBridge Notification</title>
      <style>
        body { margin: 0; padding: 0; background: #f4f6f8; font-family: 'Segoe UI', Arial, sans-serif; }
        .wrapper { max-width: 560px; margin: 40px auto; background: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.08); }
        .header { background: #1A7A4A; padding: 36px 40px; text-align: center; }
        .header h1 { margin: 0; color: #ffffff; font-size: 26px; letter-spacing: 0.5px; }
        .body { padding: 36px 40px; }
        .body p { color: #444; font-size: 15px; line-height: 1.7; margin: 0 0 18px; }
        .message-box { background: #F0FDF4; border-left: 4px solid #1A7A4A; padding: 16px 20px; border-radius: 4px; color: #14532D; font-size: 15px; margin-bottom: 18px; }
        .footer { background: #f4f6f8; padding: 20px 40px; text-align: center; color: #999; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="header">
          <h1>ScrapBridge</h1>
        </div>
        <div class="body">
          <p>Hi <strong>${user.name}</strong>,</p>
          <p>You have a new notification from ScrapBridge:</p>
          <div class="message-box">${message}</div>
          <p>Log in to your dashboard to view more details.</p>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} ScrapBridge. All rights reserved.
        </div>
      </div>
    </body>
    </html>
  `;

  await transporter.sendMail({
    from: FROM_ADDRESS,
    to: user.email,
    subject: "ScrapBridge Notification",
    html,
  });
};
