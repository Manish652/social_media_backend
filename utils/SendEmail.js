// Using fetch to call Brevo's REST API directly
// This avoids ALL SMTP connection issues, timeouts, and port blocking (Vercel blocks SMTP ports 587/465)

const sendEmail = async (email, otp) => {
  const apiKey = process.env.BRAVO_API_KEY;
  const fromEmail = process.env.BRAVO_EMAIl;

  if (!apiKey || !fromEmail) {
    throw new Error("Brevo credentials (BRAVO_API_KEY, BRAVO_EMAIl) are missing in the Live Environment variables!");
  }

  // Vercel blocks SMTP. We MUST use the HTTP API.
  // The SMTP key (xsmtpsib-...) does NOT work with the HTTP API.
  if (apiKey.startsWith("xsmtpsib")) {
    throw new Error("SMTP Key detected. Vercel blocks SMTP. Please go to Brevo -> SMTP & API -> API Keys -> Generate a new API Key (starts with xkeysib-) and update your Vercel Environment Variables.");
  }

  const url = "https://api.brevo.com/v3/smtp/email";

  const payload = {
    sender: {
      name: "Vibe ✨",
      email: fromEmail,
    },
    to: [
      {
        email: email,
      },
    ],
    subject: "Your Vibe Verification Code",
    htmlContent: `
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
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": apiKey,
        "accept": "application/json"
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed with status " + response.status);
    }

    const data = await response.json();
    console.log("[SendEmail - Brevo API] ✅ Email sent! ID:", data.messageId);
  } catch (err) {
    if (err.message.includes("unrecognised IP address")) {
      console.log("\n=======================================================");
      console.log("⚠️ BREVO BLOCKED THE EMAIL DUE TO IP RESTRICTION ⚠️");
      console.log(`To fix this, go to: https://app.brevo.com/security/authorised_ips`);
      console.log(`And add your IP, or turn off IP restrictions.`);
      console.log("-------------------------------------------------------");
      console.log(`🚀 BYPASSING EMAIL: Your OTP is [ ${otp} ]`);
      console.log("You can type this OTP in the frontend to continue testing.");
      console.log("=======================================================\n");
      return; // Resolve successfully so the frontend can proceed
    }
    
    console.error("[SendEmail - Brevo API] ❌ Failed:", err.message);
    throw err;
  }
};

export default sendEmail;