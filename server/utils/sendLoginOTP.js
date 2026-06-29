import { sendEmail } from "./emailService.js";
import dotenv from "dotenv";

dotenv.config();
export const sendLoginOTP = async (
  email,
  otp
) => {

  await sendEmail({

    to: email,

    subject: "Login Verification OTP",

    html: `
      <div style="font-family:Arial,sans-serif;padding:20px">

        <h2>Yukith Hub</h2>

        <p>Your Login OTP is:</p>

        <h1 style="letter-spacing:4px">${otp}</h1>

        <p>This OTP is valid for 5 minutes.</p>

      </div>
    `

  });

};