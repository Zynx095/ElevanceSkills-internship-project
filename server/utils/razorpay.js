import Razorpay from "razorpay";
import dotenv from "dotenv";

dotenv.config();

const razorpay =
console.log("KEY:", process.env.RAZORPAY_KEY_ID);
console.log("SECRET EXISTS:", !!process.env.RAZORPAY_SECRET);
  new Razorpay({
    key_id:
      process.env.RAZORPAY_KEY_ID,

    key_secret:
      process.env.RAZORPAY_KEY_SECRET
  });

export default razorpay;