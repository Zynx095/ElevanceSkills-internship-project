import { sendEmail } from "./emailService.js";

export const sendInvoiceEmail = async (
  to,
  invoice
) => {

  await sendEmail({

    to,

    subject: "Subscription Invoice",

    html: `
      <h2>Subscription Activated</h2>

      <p><strong>Invoice Number:</strong> ${invoice.invoiceNumber}</p>

      <p><strong>Plan:</strong> ${invoice.plan}</p>

      <p><strong>Amount:</strong> ₹${invoice.amount}</p>

      <p><strong>Purchase Date:</strong> ${invoice.purchaseDate}</p>

      <br/>

      <p>Thank you for subscribing to Yukith Hub.</p>
    `

  });

};