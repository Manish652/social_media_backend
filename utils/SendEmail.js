import nodemailer from "nodemailer";

// Lazy transporter - created on first use, not at module load
// This avoids cold-start connection hangs on live hosting
let _transporter = null;

function getTransporter() {
  if (!_transporter) {
    if (!process.env.BRAVO_API_KEY || !process.env.BRAVO_EMAIl) {
        throw new Error("Brevo SMTP credentials (BRAVO_API_KEY, BRAVO_EMAIl) are missing in .env");
    }

    _transporter = nodemailer.createTransport({
      host: "smtp-relay.brevo.com",
      port: 587,
      auth: {
        user: process.env.BRAVO_EMAIl,
        pass: process.env.BRAVO_API_KEY, // xsmtpsib-... key
      },
      // Crucial: short timeouts so it fails fast instead of hanging forever
      connectionTimeout: 8000,   // 8s to connect
      greetingTimeout: 8000,     // 8s for EHLO
      socketTimeout: 10000,      // 10s socket inactivity
      pool: false,               // Don't pool – create fresh connection each time
    });
  }
  return _transporter;
}

// Reset transporter on failure so next call gets a fresh one
function resetTransporter() {
  _transporter = null;
}

const sendEmail = async (email, otp) => {
  const mailOptions = {
    from: `"Vibe ✨" <${process.env.BRAVO_EMAIl}>`,
    to: email,
    subject: "Your Vibe Verification Code",
    html: `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #f4f7f9; margin: 0; padding: 0; }
        .container { max-width: 440px; margin: 40px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
        .header { background: linear-gradient(135deg, #7c3aed, #db2777); padding: 32px; text-align: center; }
        .header h1 { color: #ffffff; margin: 0; font-size: 26px; font-weight: 800; }
        .content { padding: 36px 30px; text-align: center; }
        .content p { color: #4b5563; font-size: 15px; line-height: 1.6; margin: 0 0 20px; }
        .otp-box { display: inline-block; background: #f5f3ff; color: #5b21b6; font-size: 36px; font-weight: 900; letter-spacing: 10px; padding: 16px 28px; border-radius: 12px; border: 2px solid #ede9fe; margin: 8px 0 20px; }
        .validity { color: #dc2626; font-weight: 600; font-size: 13px; }
        .footer { background: #f9fafb; padding: 18px; text-align: center; border-top: 1px solid #f0f0f0; }
        .footer p { color: #9ca3af; font-size: 11px; margin: 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header"><h1>✨ Vibe</h1></div>
        <div class="content">
          <p>Hey there! Here's your one-time verification code to join Vibe:</p>
          <div class="otp-box">${otp}</div>
          <p class="validity">⏳ Expires in 10 minutes</p>
          <p style="font-size:13px;color:#9ca3af;margin-top:24px;">If you didn't request this, you can safely ignore this email.</p>
        </div>
        <div class="footer"><p>© ${new Date().getFullYear()} Vibe Media · All rights reserved.</p></div>
      </div>
    </body>
    </html>
    `,
  };

  try {
    const transporter = getTransporter();
    const info = await transporter.sendMail(mailOptions);
    console.log("[SendEmail - Brevo SMTP] ✅ Email sent! ID:", info.messageId);
  } catch (err) {
    // Reset on failure so next request gets a fresh transporter
    resetTransporter();
    console.error("[SendEmail - Brevo SMTP] ❌ Failed:", err.message);
    throw err;
  }
};

export default sendEmail;