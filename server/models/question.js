import mongoose from "mongoose";
import User from "../models/auth.js";
const questionschema = mongoose.Schema(
  {
    questiontitle: { type: String, required: true },
    questionbody: { type: String, required: true },
    questiontags: { type: [String], required: true },
    noofanswer: { type: Number, default: 0 },
    upvote: { type: [String], default: [] },
    downvote: { type: [String], default: [] },
    userposted: { type: String },
    userid: { type: String },
    askedon: { type: Date, default: Date.now },
    answer: [
      {
        answerbody: String,
        useranswered: String,
        userid: String,
        upvotes: {
          type: Number,
          default: 0
        },

        downvotes: {
          type: Number,
          default: 0
        },

        bonusAwarded: {
          type: Boolean,
          default: false
        },

        answeredon: {
          type: Date,
          default: Date.now
        },
        downvotePenaltyApplied: {
          type: Boolean,
          default: false
        }
      }
    ]
  },
  { timestamp: true }
);
export default mongoose.model("question", questionschema);
