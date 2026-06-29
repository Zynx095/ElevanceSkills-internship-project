import { sendEmail } from "./emailService.js";
import dotenv from "dotenv";

dotenv.config();
export const sendLanguageOTP = async (
  email,
  otp
) => {

  await sendEmail({

    to: email,

    subject: "Language Verification",

    html: `
      <div style="font-family:Arial,sans-serif;padding:20px">

        <h2>Language Change Verification</h2>

        <p>Your OTP is:</p>

        <h1 style="letter-spacing:4px">${otp}</h1>

      </div>
    `

  });

};