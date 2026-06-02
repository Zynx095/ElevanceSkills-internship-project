import mongoose from "mongoose";
import user from "../models/auth.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const Signup = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const exisitinguser = await user.findOne({ email });
    if (exisitinguser) {
      return res.status(404).json({ message: "User already exist" });
    }

    const hashpassword = await bcrypt.hash(password, 12);

    const newuser = await user.create({
      name,
      email,
      password: hashpassword,
    });

    const token = jwt.sign(
      { email: newuser.email, id: newuser._id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({ data: newuser, token });
  } catch (error) {
    res.status(500).json("something went wrong..");
    return;
  }
};

export const Login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const exisitinguser = await user.findOne({ email });
    if (!exisitinguser) {
      return res.status(404).json({ message: "User does not exist" });
    }

    const ispasswordcrct = await bcrypt.compare(
      password,
      exisitinguser.password
    );
    if (!ispasswordcrct) {
      return res.status(400).json({ message: "Invalid password" });
    }
    const token = jwt.sign(
      { email: exisitinguser.email, id: exisitinguser._id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    res.status(200).json({ data: exisitinguser, token });
  } catch (error) {
    res.status(500).json("something went wrong..");
    return;
  }
};

export const getallusers = async (req, res) => {
  try {
    const alluser = await user.find();
    res.status(200).json({ data: alluser });
  } catch (error) {
    res.status(500).json("something went wrong..");
    return;
  }
};

export const updateprofile = async (req, res) => {
  const { id: _id } = req.params;
  const { name, about, tags } = req.body.editForm;
  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return res.status(400).json({ message: "User unavailable" });
  }
  try {
    const updateprofile = await user.findByIdAndUpdate(
      _id,
      { $set: { name: name, about: about, tags: tags } },
      { new: true }
    );
    res.status(200).json({ data: updateprofile });
  } catch (error) {
    console.log(error);
    res.status(500).json("something went wrong..");
    return;
  }
};

export const transferPoints = async (req, res) => {
  const { senderId, receiverId, points } = req.body;

  try {
    if (points <= 0) {
      return res.status(400).json({ message: "Points must be greater than 0" });
    }

    if (senderId === receiverId) {
      return res.status(400).json({ message: "Sender and receiver cannot be the same user" });
    }

    const sender = await user.findById(senderId);
    const receiver = await user.findById(receiverId);

    if (!sender) {
      return res.status(400).json({ message: "Sender not found" });
    }

    if (!receiver) {
      return res.status(400).json({ message: "Receiver not found" });
    }

    if (sender.rewardPoints <= 10) {
      return res.status(400).json({ message: "Sender must have more than 10 reward points to transfer" });
    }

    if (sender.rewardPoints < points) {
      return res.status(400).json({ message: "Sender does not have enough points for transfer" });
    }

    sender.rewardPoints -= points;
    receiver.rewardPoints += points;

    await sender.save();
    await receiver.save();

    res.status(200).json({ message: "Points transferred successfully" });

  } catch (error) {
  console.log(error.response?.data);
  toast.error(
    error?.response?.data?.message || "Transfer failed"
  );
}atus(500).json({ message: "something went wrong.." });
  };