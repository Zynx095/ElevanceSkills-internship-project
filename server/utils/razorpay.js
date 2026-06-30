import Razorpay from "razorpay";
import dotenv from "dotenv";

dotenv.config();

console.log("========== RAZORPAY DEBUG ==========");
console.log("KEY ID:", process.env.RAZORPAY_KEY_ID);
console.log(
  "SECRET EXISTS:",
  process.env.RAZORPAY_KEY_SECRET ? "YES" : "NO"
);

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

console.log("INSTANCE CREATED:", !!razorpay);
console.log("====================================");
console.log("Prototype:", Object.getPrototypeOf(razorpay));
console.log("Keys:", Object.keys(razorpay));
console.log("Orders:", razorpay.orders);

export default razorpay;