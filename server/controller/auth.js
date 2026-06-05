import mongoose from "mongoose";
import user from "../models/auth.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { UAParser } from "ua-parser-js";

export const updateBadges = async (userId) => {
  try {
    const currentUser = await user.findById(userId);
    if (!currentUser) return;

    const earnedBadges = new Set(currentUser.badges || []);

    if (currentUser.rewardPoints >= 10) earnedBadges.add("Bronze Contributor");
    if (currentUser.rewardPoints >= 50) earnedBadges.add("Silver Contributor");
    if (currentUser.rewardPoints >= 100) earnedBadges.add("Gold Contributor");
    if (currentUser.rewardPoints >= 200) earnedBadges.add("Elite Contributor");

    currentUser.badges = Array.from(earnedBadges);
    await currentUser.save();
  } catch (error) {
    console.log("Badge update error:", error);
  }
};

const generateRandomPassword = (length = 10) => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

  let password = "";

  for (let i = 0; i < length; i++) {
    password += chars.charAt(
      Math.floor(Math.random() * chars.length)
    );
  }

  return password;
};
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
    const parser = new UAParser(
      req.headers["user-agent"]
    );

    const browser =
      parser.getBrowser().name || "Unknown";

    const os =
      parser.getOS().name || "Unknown";

    const device =
      parser.getDevice().type || "Desktop";

    const ip =
      req.headers["x-forwarded-for"] ||
      req.socket.remoteAddress ||
      "Unknown";

    exisitinguser.loginHistory.push({
      browser,
      os,
      device,
      ip,
      loginTime: new Date(),
    });

    await exisitinguser.save();
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
export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const existingUser = await user.findOne({ email });

    if (!existingUser) {
      return res
        .status(404)
        .json({ message: "User not found" });
    }

    const today = new Date();

    if (existingUser.forgotPasswordLastUsed) {
      const lastUsed = new Date(
        existingUser.forgotPasswordLastUsed
      );

      const sameDay =
        lastUsed.getDate() === today.getDate() &&
        lastUsed.getMonth() === today.getMonth() &&
        lastUsed.getFullYear() === today.getFullYear();

      if (sameDay) {
        return res.status(400).json({
          message:
            "You can use this option only one time per day."
        });
      }
    }

    const newPassword = generateRandomPassword();

    const hashedPassword = await bcrypt.hash(
      newPassword,
      12
    );

    existingUser.password = hashedPassword;
    existingUser.forgotPasswordLastUsed = today;

    await existingUser.save();

    res.status(200).json({
      message: "Password reset successful",
      newPassword,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "something went wrong..",
    });
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

    sender.transferHistory.push({
      type: "SENT",
      points,
      otherUserId: receiver._id,
      otherUserName: receiver.name
    });

    receiver.transferHistory.push({
      type: "RECEIVED",
      points,
      otherUserId: sender._id,
      otherUserName: sender.name
    });

    await sender.save();
    await receiver.save();

    await updateBadges(sender._id);
    await updateBadges(receiver._id);

    res.status(200).json({ message: "Points transferred successfully" });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "something went wrong.." });
  }
};
export const sendFriendRequest = async (req, res) => {
  const { senderId, receiverId } = req.body;

  try {
    const sender = await user.findById(senderId);
    const receiver = await user.findById(receiverId);

    if (!sender || !receiver) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    if (
      receiver.friendRequests.includes(senderId)
    ) {
      return res.status(400).json({
        message: "Request already sent"
      });
    }

    if (
      receiver.friends.includes(senderId)
    ) {
      return res.status(400).json({
        message: "Already friends"
      });
    }

    receiver.friendRequests.push(senderId);

    await receiver.save();

    res.status(200).json({
      message: "Friend request sent"
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "something went wrong.."
    });
  }
};

 export const acceptFriendRequest = async (req, res) => {
  const { userId, senderId } = req.body;

  try {
    const currentUser = await user.findById(userId);
    const sender = await user.findById(senderId);

    if (!currentUser || !sender) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    currentUser.friendRequests =
      currentUser.friendRequests.filter(
        (id) => id !== senderId
      );

    currentUser.friends.push(senderId);

    sender.friends.push(userId);

    await currentUser.save();
    await sender.save();

    res.status(200).json({
      message: "Friend request accepted"
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "something went wrong.."
    });
  }
};