import mongoose from "mongoose";

const postSchema = mongoose.Schema(
  {
    caption: {
      type: String,
      default: ""
    },

    mediaUrl: {
      type: String,
      default: ""
    },

    mediaType: {
      type: String,
      enum: ["image", "video"],
      required: true
    },

    userId: {
      type: String,
      required: true
    },

    userName: {
      type: String,
      required: true
    },

    likes: {
      type: [String],
      default: []
    },

    comments: [
      {
        userId: String,
        userName: String,
        comment: String,
        commentedOn: {
          type: Date,
          default: Date.now
        }
      }
    ],

    shareCount: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model(
  "post",
  postSchema
);