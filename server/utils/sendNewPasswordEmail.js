import { sendEmail } from "./emailService.js";
import dotenv from "dotenv";

dotenv.config();
export const sendNewPasswordEmail = async (
  email,
  password
) => {

  await sendEmail({

    to: email,

    subject: "Your New Password",

    html: `
      <div style="font-family:Arial,sans-serif;padding:20px">

        <h2>Password Reset Successful</h2>

        <p>Your new password is:</p>

        <h1>${password}</h1>

      </div>
    `

  });

};