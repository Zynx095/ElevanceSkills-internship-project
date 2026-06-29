import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config();

const transporter =
  nodemailer.createTransport({
    service: "gmail",
    auth: {
      user:
        process.env.EMAIL_USER,
      pass:
        process.env.EMAIL_PASS
    }
  });

export const sendLoginOTP =
  async (
    email,
    otp
  ) => {

    await transporter.sendMail({

      from:
        process.env.EMAIL_USER,

      to:
        email,

      subject:
        "Login Verification OTP",

      html: `
        <h2>
          Login Verification
        </h2>

        <p>
          Your login OTP is:
        </p>

        <h1>
          ${otp}
        </h1>

        <p>
          This OTP is valid for 5 minutes.
        </p>

        <p>
          If you did not attempt to login,
          please ignore this email.
        </p>
      `

    });

  };