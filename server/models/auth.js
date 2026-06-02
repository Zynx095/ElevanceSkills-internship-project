import mongoose from "mongoose";

const userschema = mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  about: { type: String },
  tags: { type: [String] },
  joinDate: { type: Date, default: Date.now },
  friends: { type: [String], default: [] },
  rewardPoints: { type: Number, default: 0 },
  subscriptionPlan: { type: String, default: "FREE" },
  subscriptionExpiry: { type: Date },
  language: { type: String, default: "English" },
  mobile: { type: String },
  forgotPasswordLastUsed: { type: Date },
  loginHistory: [{
    browser: String, os: String, device: String, ip: String, loginTime: {
      type: Date, default: Date.now
    }
  }
  ]
});
export default mongoose.model("user", userschema);
