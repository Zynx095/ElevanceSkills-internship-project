import mongoose from "mongoose";
import question from "../models/question.js";
import User from "../models/auth.js";
import { updateBadges } from "./auth.js";

export const Askanswer = async (req, res) => {
  const { id: _id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return res.status(400).json({ message: "question unavailable" });
  }

  const { answerbody, useranswered, userid } = req.body;

  try {
    const updatequestion = await question.findByIdAndUpdate(
      _id,
      {
        $addToSet: {
          answer: [{ answerbody, useranswered, userid }]
        }
      },
      { new: true }
    );

    const calculatedNoOfAnswer = updatequestion.answer.length;

    await question.findByIdAndUpdate(
      _id,
      {
        $set: { noofanswer: calculatedNoOfAnswer }
      }
    );

    await User.findByIdAndUpdate(
      userid,
      {
        $inc: { rewardPoints: 5 }
      }
    );

    await updateBadges(userid);

    res.status(200).json({ data: updatequestion });

  } catch (error) {
    console.log(error);
    res.status(500).json("something went wrong..");
  }
};

const updatenoofanswer = async (_id, noofanswer) => {
  try {
    await question.findByIdAndUpdate(
      _id,
      {
        $set: { noofanswer: noofanswer }
      }
    );
  } catch (error) {
    console.log(error);
  }
};

export const deleteanswer = async (req, res) => {
  const { id: _id } = req.params;
  const { noofanswer, answerid } = req.body;

  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return res.status(400).json({ message: "question unavailable" });
  }

  if (!mongoose.Types.ObjectId.isValid(answerid)) {
    return res.status(400).json({ message: "answer unavailable" });
  }

  try {
    const q = await question.findById(_id);

    const ans = q.answer.id(answerid);

    if (ans) {
      await User.findByIdAndUpdate(
        ans.userid,
        {
          $inc: { rewardPoints: -5 }
        }
      );
      await updateBadges(ans.userid);
    }

    const updatequestion = await question.updateOne(
      { _id },
      {
        $pull: {
          answer: { _id: answerid }
        }
      }
    );
    const updatedQuestion = await question.findById(_id);

    await question.findByIdAndUpdate(
      _id,
      {
        $set: {
          noofanswer: updatedQuestion.answer.length
        }
      }
    );

    res.status(200).json({ data: updatequestion });

  } catch (error) {
    console.log(error);
    res.status(500).json("something went wrong..");
  }
};

export const voteAnswer = async (req, res) => {
  const { id: questionId } = req.params;
  const { answerId, value } = req.body;


  if (!mongoose.Types.ObjectId.isValid(questionId)) {
    return res.status(400).json({ message: "Question unavailable" });
  }

  if (!mongoose.Types.ObjectId.isValid(answerId)) {
    return res.status(400).json({ message: "Answer unavailable" });
  }

  try {
    const q = await question.findById(questionId);

    if (!q) {
      return res.status(404).json({ message: "Question not found" });
    }

    const ans = q.answer.id(answerId);

    if (!ans) {
      return res.status(404).json({ message: "Answer not found" });
    }

    if (value === "upvote") {
      ans.upvotes = (ans.upvotes || 0) + 1;

      console.log("UPVOTES:", ans.upvotes);
      console.log("BONUS:", ans.bonusAwarded);
      console.log("USERID:", ans.userid);

      if (
        ans.upvotes >= 5 &&
        ans.bonusAwarded !== true
      ) {
        console.log("BONUS TRIGGERED");

        await User.findByIdAndUpdate(
          ans.userid,
          {
            $inc: {
              rewardPoints: 10,
            },
          }
        );

        ans.bonusAwarded = true;
        await updateBadges(ans.userid);
      }
    } else if (value === "downvote") {
      ans.downvotes = (ans.downvotes || 0) + 1;

      if (ans.downvotePenaltyApplied !== true) {
        await User.findByIdAndUpdate(
          ans.userid,
          {
            $inc: {
              rewardPoints: -5
            }
          }
        );

        ans.downvotePenaltyApplied = true;

        await updateBadges(ans.userid);
      }
    } else {
      return res.status(400).json({
        message: "Invalid vote value",
      });
    }

    await q.save();

    res.status(200).json({
      message: "Answer vote updated",
      answer: ans,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json("something went wrong..");
  }
};