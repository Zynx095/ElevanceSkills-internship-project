import mongoose from "mongoose";
import user from "../models/auth.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { UAParser } from "ua-parser-js";
import {
  sendInvoiceEmail
} from "../utils/sendEmail.js";
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
    console.log("GENERATING TOKEN");
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
const generateOTP = () => {
  return Math.floor(
    100000 + Math.random() * 900000
  ).toString();
};
export const Login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const exisitinguser = await user.findOne({ email });
    if (!exisitinguser) {
      return res.status(404).json({ message: "User does not exist" });
    }
    if (
      exisitinguser.subscriptionExpiry &&
      new Date() >
      new Date(
        exisitinguser.subscriptionExpiry
      )
    ) {

      exisitinguser.subscriptionPlan =
        "FREE";

      exisitinguser.subscriptionExpiry =
        null;
      console.log(
        "Subscription expired. Downgraded to FREE."
      );

      await exisitinguser.save();

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

    if (browser === "Chrome") {

      const otp =
        generateOTP();

      exisitinguser.loginOTP =
        otp;

      console.log(
        "OTP:",
        otp
      );

      exisitinguser.otpExpiry =
        new Date(
          Date.now() +
          5 * 60 * 1000
        );

      await exisitinguser.save();

      return res.status(200).json({
        otpRequired: true,
        email:
          exisitinguser.email
      });

    }

    const os =
      parser.getOS().name || "Unknown";

    const device =
      parser.getDevice().type || "Desktop";

    const currentHour =
      new Date().getHours();

    if (
      device === "mobile" &&
      (currentHour < 10 || currentHour >= 13)
    ) {
      return res.status(403).json({
        message:
          "Mobile login is allowed only between 10 AM and 1 PM."
      });
    }

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
export const updateLanguage = async (
  req,
  res
) => {

  const { id } = req.params;

  const { language } =
    req.body;

  try {

    const existingUser =
      await user.findById(id);
    console.log(
      "UPDATE USER ID:",
      existingUser._id
    );

    if (!existingUser) {
      return res.status(404).json({
        message: "User not found"
      });
    }
    const checkUser =
      await user.findById(id);

    console.log(
      "AFTER SAVE:",
      checkUser.languageOTP
    );

    console.log(
      "AFTER SAVE PENDING:",
      checkUser.pendingLanguage
    );

    const otp =
      generateOTP();

    existingUser.languageOTP =
      otp;

    existingUser.pendingLanguage =
      language;

    existingUser.languageOTPExpiry =
      new Date(
        Date.now() +
        5 * 60 * 1000
      );
    await existingUser.save();

    console.log(
      "LANGUAGE OTP:",
      otp
    );

    res.status(200).json({
      otpRequired: true,
      otp,
      message:
        language === "French"
          ? "Email OTP required"
          : "Mobile OTP required"
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message:
        "something went wrong.."
    });

  }

};
export const updateSubscription = async (req, res) => {
  const { id } = req.params;
  const { subscriptionPlan } = req.body;

  try {

    const now = new Date();

    const indiaHour = new Date(
      now.toLocaleString(
        "en-US",
        {
          timeZone: "Asia/Kolkata"
        }
      )
    ).getHours();

    if (false) {
      return res.status(403).json({
        message:
          "Payments are allowed only between 10 AM and 11 AM IST."
      });
    }
    let amount = 0;

    if (
      subscriptionPlan === "BRONZE"
    ) {
      amount = 100;
    }

    if (
      subscriptionPlan === "SILVER"
    ) {
      amount = 300;
    }

    if (
      subscriptionPlan === "GOLD"
    ) {
      amount = 1000;
    }

    const invoice = {
      invoiceNumber:
        "INV-" +
        Date.now(),

      plan:
        subscriptionPlan,

      amount,

      purchaseDate:
        new Date()
    };

    const updatedUser =
      await user.findByIdAndUpdate(
        id,
        {
          subscriptionPlan,

          subscriptionExpiry:
            new Date(
              Date.now() +
              30 * 24 * 60 * 60 * 1000
            ),

          $push: {
            invoiceHistory:
              invoice
          }
        },
        {
          new: true
        }
      );
    await sendInvoiceEmail(
      updatedUser.email,
      invoice
    );

    res.status(200).json({
      message:
        "Subscription activated",

      data:
        updatedUser,

      invoice
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message:
        "something went wrong.."
    });

  }
};
export const verifyLanguageOTP =
  async (
    req,
    res
  ) => {

    const { id } =
      req.params;

    const { otp } =
      req.body;

    try {

      const existingUser =
        await user.findById(id);
      console.log(
        "VERIFY LANGUAGE OTP HIT"
      );
      console.log(
        "VERIFY USER ID:",
        existingUser._id
      );
      if (!existingUser) {
        return res.status(404).json({
          message:
            "User not found"
        });
      }
      console.log("OTP FROM USER:", otp);

      console.log(
        "OTP IN DATABASE:",
        existingUser.languageOTP
      );

      if (
        existingUser.languageOTP !==
        otp
      ) {
        return res.status(400).json({
          message:
            "Invalid OTP"
        });
      }

      if (
        new Date() >
        new Date(
          existingUser.languageOTPExpiry
        )
      ) {
        return res.status(400).json({
          message:
            "OTP expired"
        });
      }

      existingUser.language =
        existingUser.pendingLanguage;

      existingUser.pendingLanguage =
        null;

      existingUser.languageOTP =
        "";

      existingUser.languageOTPExpiry =
        null;

      await existingUser.save();

      res.status(200).json({
        message:
          "Language updated successfully",
        language:
          existingUser.language
      });

    } catch (error) {

      console.log(error);

      res.status(500).json({
        message:
          "something went wrong.."
      });

    }

  };
export const verifyLoginOTP =
  async (
    req,
    res
  ) => {

    const { email, otp } =
      req.body;

    try {

      const existingUser =
        await user.findOne({
          email
        });

      if (!existingUser) {
        return res.status(404).json({
          message:
            "User not found"
        });
      }

      if (
        String(
          existingUser.loginOTP
        ) !==
        String(otp)
      ) {
        return res.status(400).json({
          message:
            "Invalid OTP"
        });
      }

      if (
        new Date() >
        new Date(
          existingUser.otpExpiry
        )
      ) {
        return res.status(400).json({
          message:
            "OTP expired"
        });
      }

      existingUser.loginOTP =
        "";

      existingUser.otpExpiry =
        null;

      await existingUser.save();

      const token =
        jwt.sign(
          {
            email:
              existingUser.email,
            id:
              existingUser._id
          },
          process.env.JWT_SECRET,
          {
            expiresIn: "1h"
          }
        );

      res.status(200).json({
        data:
          existingUser,
        token
      });

    } catch (error) {

      console.log(error);

      res.status(500).json({
        message:
          "something went wrong.."
      });

    }

  };
export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const existingUser = await user.findOne({ email });
    console.log(
      "PLAN:",
      exisitinguser.subscriptionPlan
    );

    console.log(
      "EXPIRY:",
      exisitinguser.subscriptionExpiry
    );

    console.log(
      "NOW:",
      new Date()
    );
    if (
      exisitinguser.subscriptionExpiry &&
      new Date() >
      new Date(
        exisitinguser.subscriptionExpiry
      )
    ) {

      exisitinguser.subscriptionPlan =
        "FREE";

      exisitinguser.subscriptionExpiry =
        null;

      await exisitinguser.save();

      console.log(
        "Subscription expired. Downgraded to FREE."
      );
    }

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