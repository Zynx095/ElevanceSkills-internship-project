
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

export const sendNewPasswordEmail =
  async (
    email,
    password
  ) => {

    await transporter.sendMail({

      from:
        process.env.EMAIL_USER,

      to:
        email,

      subject:
        "Your New Password",

      html: `

        <h2>
          Password Reset Successful
        </h2>

        <p>
          Your new password is:
        </p>

        <h1>
          ${password}
        </h1>

        <p>
          Please login and change it.
        </p>

      `

    });

  };