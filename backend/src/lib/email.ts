import { env } from "./env.js";

interface SendOtpEmailParams {
  toEmail: string;
  otpCode: string;
  brideName: string;
  groomName: string;
}

export const sendOtpEmail = async ({
  toEmail,
  otpCode,
  brideName,
  groomName,
}: SendOtpEmailParams): Promise<boolean> => {
  // If no Brevo API key is configured or in development, log nicely to console for testing
  if (!env.BREVO_API_KEY) {
    console.log("\n=======================================================");
    console.log(`✉️ [Brevo Dev Mock] OTP Email to: ${toEmail}`);
    console.log(`Couple: ${brideName} & ${groomName}`);
    console.log(`Your Verification Code: >>> [ ${otpCode} ] <<<`);
    console.log("Valid for 10 minutes (HMAC hashed in database)");
    console.log("=======================================================\n");
    return true;
  }

  try {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": env.BREVO_API_KEY,
      },
      body: JSON.stringify({
        sender: {
          name: env.BREVO_SENDER_NAME,
          email: env.BREVO_SENDER_EMAIL,
        },
        to: [{ email: toEmail }],
        subject: `${otpCode} is your Wedding Platform Verification Code`,
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 8px;">
            <h2 style="color: #2d3748; margin-bottom: 8px;">Welcome, ${brideName} & ${groomName}!</h2>
            <p style="color: #4a5568; font-size: 16px;">Thank you for registering on Wedding Invitations. Please verify your email address to activate your account and start creating your invitations.</p>
            <div style="background-color: #f7fafc; padding: 20px; border-radius: 8px; text-align: center; margin: 24px 0;">
              <span style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #1a202c;">${otpCode}</span>
            </div>
            <p style="color: #718096; font-size: 14px;">This code will expire in <strong>10 minutes</strong>. If you did not request this registration, please disregard this email.</p>
          </div>
        `,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Brevo API Error:", response.status, errorText);
      return false;
    }

    return true;
  } catch (error) {
    console.error("❌ Failed to send OTP email via Brevo:", error);
    return false;
  }
};

export const sendPasswordResetEmail = async ({
  toEmail,
  otpCode,
  brideName,
  groomName,
}: SendOtpEmailParams): Promise<boolean> => {
  // If no Brevo API key is configured or in development, log nicely to console for testing
  if (!env.BREVO_API_KEY) {
    console.log("\n=======================================================");
    console.log(`✉️ [Brevo Dev Mock] Password Reset Code to: ${toEmail}`);
    console.log(`Couple: ${brideName} & ${groomName}`);
    console.log(`Your Password Reset Code: >>> [ ${otpCode} ] <<<`);
    console.log("Valid for 10 minutes (HMAC hashed in database)");
    console.log("=======================================================\n");
    return true;
  }

  try {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": env.BREVO_API_KEY,
      },
      body: JSON.stringify({
        sender: {
          name: env.BREVO_SENDER_NAME,
          email: env.BREVO_SENDER_EMAIL,
        },
        to: [{ email: toEmail }],
        subject: `${otpCode} is your Password Reset Code`,
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 8px;">
            <h2 style="color: #2d3748; margin-bottom: 8px;">Password Reset Request</h2>
            <p style="color: #4a5568; font-size: 16px;">Hello ${brideName} & ${groomName},</p>
            <p style="color: #4a5568; font-size: 16px;">We received a request to reset the password for your Wedding Platform account. Use the 6-digit code below to set a new password:</p>
            <div style="background-color: #f7fafc; padding: 20px; border-radius: 8px; text-align: center; margin: 24px 0;">
              <span style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #1a202c;">${otpCode}</span>
            </div>
            <p style="color: #718096; font-size: 14px;">This code will expire in <strong>10 minutes</strong>. If you did not request a password reset, please ignore this email and your password will remain unchanged.</p>
          </div>
        `,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Brevo API Error:", response.status, errorText);
      return false;
    }

    return true;
  } catch (error) {
    console.error("❌ Failed to send password reset email via Brevo:", error);
    return false;
  }
};

