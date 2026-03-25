import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});
const sendEmail = async (email, otp) => {
    const mailOptions = {
        from: `"Vibe Media " <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Verify Your Email - OTP Inside",
        html: `
     <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background-color: #f4f7f9; margin: 0; padding: 0; }
        .container { max-width: 450px; margin: 40px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
        .header { background: #007AFF; padding: 30px; text-align: center; }
        .header h1 { color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px; }
        .content { padding: 40px 30px; text-align: center; }
        .content p { color: #4b5563; font-size: 16px; line-height: 1.5; margin-bottom: 25px; }
        .otp-code { display: inline-block; background: #f3f4f6; color: #111827; font-size: 32px; font-weight: 800; letter-spacing: 8px; padding: 15px 25px; border-radius: 8px; border: 1px solid #e5e7eb; margin: 10px 0; }
        .footer { background: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #eeeeee; }
        .footer p { color: #9ca3af; font-size: 12px; margin: 0; }
        .validity { color: #ef4444; font-weight: 600; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>SocialApp</h1>
        </div>
        <div class="content">
          <p>Hi there! Use the code below to verify your account and start connecting.</p>
          <div class="otp-code">${otp}</div>
          <p class="validity">Valid for the next 10 minutes</p>
          <p style="margin-top: 30px; font-size: 14px;">If you didn't request this, you can safely ignore this email.</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} Social Media App. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
    `,
    };

    await transporter.sendMail(mailOptions);

}

export default sendEmail;