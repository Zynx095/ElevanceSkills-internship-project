import dotenv from "dotenv";
dotenv.config();
console.log(process.env.TEXTBEE_BASE_URL);
console.log(process.env.TEXTBEE_API_KEY);
console.log(process.env.TEXTBEE_DEVICE_ID);
import { sendSMS } from "./services/sms.js";

await sendSMS(

    "+919902977002",

    "Hello from TextBee"

);