import nodemailer from "nodemailer";
import dotenv from "dotenv";
import resend from "./resend.js";

dotenv.config();
console.log(
    process.env.EMAIL_USER
);

console.log(
    process.env.EMAIL_PASS
);
await resend.emails.send({
  from: "Yukith Hub <onboarding@resend.dev>",
  to: email,
  subject: "Login Verification OTP",
  html: `
    <h2>Login Verification</h2>
    <h1>${otp}</h1>
    <p>This OTP is valid for 5 minutes.</p>
  `,
});

export const sendInvoiceEmail =
    async (
        to,
        invoice
    ) => {

        const mailOptions = {
            from:
                process.env.EMAIL_USER,

            to,

            subject:
                "Subscription Invoice",

            html: `
        <h2>Subscription Activated</h2>

        <p>
          Invoice Number:
          ${invoice.invoiceNumber}
        </p>

        <p>
          Plan:
          ${invoice.plan}
        </p>

        <p>
          Amount:
          ₹${invoice.amount}
        </p>

        <p>
          Purchase Date:
          ${invoice.purchaseDate}
        </p>
      `
        };


        await transporter.sendMail(
            mailOptions
        );

    };