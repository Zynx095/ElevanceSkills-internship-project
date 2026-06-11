import mongoose from "mongoose";

const userschema = mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  about: { type: String },
  tags: { type: [String] },
  joinDate: { type: Date, default: Date.now },
  friends: { type: [String], default: [] },
  friendRequests: { type: [String], default: [] },
  rewardPoints: { type: Number, default: 0 },
  subscriptionPlan: { type: String, default: "FREE" },
  subscriptionExpiry: { type: Date },
  language: { type: String, default: "English" },
  mobile: { type: String },
  loginOTP: {
  type: String,
  default: ""
},

otpExpiry: {
  type: Date
},

languageOTP: {
  type: String,
  default: ""
},

languageOTPExpiry: {
  type: Date
},

pendingLanguage: {
  type: String
},

forgotPasswordLastUsed: {
  type: Date
},

loginHistory: [
  {
    browser: String,
    os: String,
    device: String,
    ip: String,
    loginTime: {
      type: Date,
      default: Date.now
    }
  }
],

transferHistory: [
  {
    type: {
      type: String
    },
    points: Number,
    otherUserId: String,
    otherUserName: String,
    date: {
      type: Date,
      default: Date.now
    }
  }
],
invoiceHistory: [
  {
    invoiceNumber: String,
    plan: String,
    amount: Number,
    purchaseDate: {
      type: Date,
      default: Date.now
    }
  }
],
badges: {
  type: [String],
  default: []
}
});

export default mongoose.model("user", userschema);