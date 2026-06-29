import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();
console.log(
    process.env.EMAIL_USER
);

console.log(
    process.env.EMAIL_PASS
);
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
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