import mongoose from "mongoose";
import question from "../models/question.js";
import User from "../models/auth.js";

export const Askanswer = async (req, res) => {
  const { id: _id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return res.status(400).json({ message: "question unavailable" });
  }

  // noofanswer is removed from req.body since it will be calculated on the backend
  const { answerbody, useranswered, userid } = req.body;

  try {
    // 1. Add the new answer and fetch the newly updated document
    const updatequestion = await question.findByIdAndUpdate(
      _id,
      {
        $addToSet: {
          answer: [{ answerbody, useranswered, userid }]
        }
      },
      { new: true }
    );

    // 2. Calculate the exact number of answers from the database
    const calculatedNoOfAnswer = updatequestion.answer.length;

    // 3. Update the question's noofanswer field with the true count
    await question.findByIdAndUpdate(
      _id,
      {
        $set: { noofanswer: calculatedNoOfAnswer }
      }
    );

    // 4. Update the user's reward points
    await User.findByIdAndUpdate(
      userid,
      {
        $inc: { rewardPoints: 5 }
      }
    );

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