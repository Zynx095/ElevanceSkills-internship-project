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
    let subscriptionLimit = 1;

    switch (currentUser.subscriptionPlan) {

      case "BRONZE":
        subscriptionLimit = 5;
        break;

      case "SILVER":
        subscriptionLimit = 10;
        break;

      case "GOLD":
        subscriptionLimit = Infinity;
        break;

      default:
        subscriptionLimit = 1;
    }

    const dailyLimit =
      subscriptionLimit;

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
        message: `Daily posting limit reached (${isUnlimited ? "Unlimited" : dailyLimit} posts/day)`
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
export const getQuestionStatus =
  async (req, res) => {

    try {

      const user =
        await User.findById(
          req.params.userId
        );

      if (!user) {
        return res.status(404).json({
          message: "User not found"
        });
      }

      let dailyLimit = 1;

      switch (
      user.subscriptionPlan
      ) {

        case "BRONZE":
          dailyLimit = 5;
          break;

        case "SILVER":
          dailyLimit = 10;
          break;

        case "GOLD":
          dailyLimit = Infinity;
          break;
      }

      const today =
        new Date();

      today.setHours(
        0,
        0,
        0,
        0
      );

      const questionsToday =
        await question.countDocuments({
          userid: user._id,
          askedon: {
            $gte: today
          }
        });

      const unlimited =
        user.subscriptionPlan === "GOLD";

      res.status(200).json({
        plan: user.subscriptionPlan,
        used: questionsToday,
        limit: unlimited ? -1 : dailyLimit,
        remaining: unlimited ? -1 : dailyLimit - questionsToday,
        unlimited
      });

    } catch (error) {

      res.status(500).json({
        message:
          "something went wrong"
      });

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
  const { value, userid } = req.body;
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
