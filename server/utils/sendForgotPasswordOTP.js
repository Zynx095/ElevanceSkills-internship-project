import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config();

const transporter =
  nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

export const sendForgotPasswordOTP =
  async (email, otp) => {

    await transporter.sendMail({

      from: process.env.EMAIL_USER,

      to: email,

      subject:
        "Forgot Password OTP",

      html: `
        <h2>Password Reset OTP</h2>

        <p>Your OTP is:</p>

        <h1>${otp}</h1>

        <p>
          Valid for 5 minutes.
        </p>
      `
    });

  };