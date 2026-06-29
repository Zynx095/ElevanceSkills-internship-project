import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config();

console.log(process.env.EMAIL_USER);
console.log(process.env.EMAIL_PASS);

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

export const sendLanguageOTP =
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
        "Language Change OTP",

      html: `
        <h2>
          Language Verification
        </h2>

        <p>
          Your OTP is:
        </p>

        <h1>
          ${otp}
        </h1>

        <p>
          Valid for 5 minutes.
        </p>
      `
    });

  };