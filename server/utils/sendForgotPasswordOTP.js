import { sendEmail } from "./emailService.js";
import dotenv from "dotenv";

dotenv.config();
export const sendForgotPasswordOTP = async (
  email,
  otp
) => {

  await sendEmail({

    to: email,

    subject: "Forgot Password OTP",

    html: `
      <div style="font-family:Arial,sans-serif;padding:20px">

        <h2>Reset Password</h2>

        <p>Your OTP is:</p>

        <h1 style="letter-spacing:4px">${otp}</h1>

        <p>This OTP expires in 5 minutes.</p>

      </div>
    `

  });

};