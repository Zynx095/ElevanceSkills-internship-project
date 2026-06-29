import { Resend } from "resend";
import dotenv from "dotenv";
dot.config();
const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = "Yukith Hub <noreply@yukithjoseph.me>";

export const sendEmail = async ({
  to,
  subject,
  html,
}) => {
  try {
    const { data, error } = await resend.emails.send({
      from: FROM,
      to,
      subject,
      html,
    });

    if (error) {
      console.error("Resend Error:", error);
      throw new Error(error.message);
    }

    console.log("Email Sent:", data);

    return data;
  } catch (err) {
    console.error("Email Service Error:", err);
    throw err;
  }
};