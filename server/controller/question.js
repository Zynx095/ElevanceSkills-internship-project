import mongoose from "mongoose";
import question from "../models/question.js";
import User from "../models/auth.js";

export const Askquestion = async (req, res) => {
  const { postquestiondata } = req.body;

  try {
    const currentUser = await User.findById(
      postquestiondata.userid
    );

    if (!currentUser) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    const friendCount =
      currentUser.friends?.length || 0;
  

    if (friendCount === 0) {
      return res.status(403).json({
        message:
          "You need at least 1 friend to post questions."
      });
    }

    let dailyLimit;

    if (friendCount >= 10) {
      dailyLimit = Infinity;
    } else {
      dailyLimit = friendCount;
    }

    const today = new Date();

    today.setHours(0, 0, 0, 0);

    const questionsToday =
      await question.countDocuments({
        userid: postquestiondata.userid,
        askedon: {
          $gte: today
        }
      });

    if (
      dailyLimit !== Infinity &&
      questionsToday >= dailyLimit
    ) {
      return res.status(403).json({
        message: `Daily posting limit reached (${dailyLimit} posts/day)`
      });
    }

    const postques =
      new question({
        ...postquestiondata
      });

    await postques.save();

    res.status(200).json({
      data: postques
    });

  } catch (error) {
    console.log(error);

    res.status(500).json(
      "something went wrong.."
    );
  }
};

export const getallquestion = async (req, res) => {
  try {
    const allquestion = await question.find().sort({ askedon: -1 });
    res.status(200).json({ data: allquestion });
  } catch (error) {
    res.status(500).json("something went wrong..");
    return;
  }
};
export const deletequestion = async (req, res) => {
  const { id: _id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return res.status(400).json({ message: "question unavailable" });
  }
  try {
    await question.findByIdAndDelete(_id);
    res.status(200).json({ message: "question deleted" });
  } catch (error) {
    res.status(500).json("something went wrong..");
    return;
  }
};
export const votequestion = async (req, res) => {
  const { id: _id } = req.params;
  const { value ,userid} = req.body;
  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return res.status(400).json({ message: "question unavailable" });
  }
  try {
    const questionDoc = await question.findById(_id);
    const upindex = questionDoc.upvote.findIndex((id) => id === String(userid));
    const downindex = questionDoc.downvote.findIndex(
      (id) => id === String(userid)
    );
    if (value === "upvote") {
      if (downindex !== -1) {
        questionDoc.downvote = questionDoc.downvote.filter(
          (id) => id !== String(userid)
        );
      }
      if (upindex === -1) {
        questionDoc.upvote.push(userid);
      } else {
        questionDoc.upvote = questionDoc.upvote.filter((id) => id !== String(userid));
      }
    } else if (value === "downvote") {
      if (upindex !== -1) {
        questionDoc.upvote = questionDoc.upvote.filter((id) => id !== String(userid));
      }
      if (downindex === -1) {
        questionDoc.downvote.push(userid);
      } else {
        questionDoc.downvote = questionDoc.downvote.filter(
          (id) => id !== String(userid)
        );
      }
    }
    const questionvote = await question.findByIdAndUpdate(_id, questionDoc, { new: true });
    res.status(200).json({ data: questionvote });
  } catch (error) {
    res.status(500).json("something went wrong..");
    return;
  }
};
