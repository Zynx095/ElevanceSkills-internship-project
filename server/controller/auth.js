import mongoose from "mongoose";
import user from "../models/auth.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { UAParser } from "ua-parser-js";
import razorpay
  from "../utils/razorpay.js";
import {
  sendLanguageOTP
} from "../utils/sendLanguageOTP.js";
import {
  sendLoginOTP
}
  from "../utils/sendLoginOTP.js";
import {
  sendInvoiceEmail
} from "../utils/sendEmail.js";
import {
  sendForgotPasswordOTP
}
  from "../utils/sendForgotPasswordOTP.js";
import {
  sendNewPasswordEmail
}
  from "../utils/sendNewPasswordEmail.js";
import { sendSMS } from "../services/sms.js";
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
  const { name, email, password, phoneNumber } = req.body;
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
      phoneNumber
    });
    console.log("GENERATING TOKEN");
    const token = jwt.sign(
      { email: newuser.email, id: newuser._id },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
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
      await sendLoginOTP(
        exisitinguser.email,
        otp
      );

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

    const currentHour = Number(
      new Intl.DateTimeFormat("en-US", {
        timeZone: "Asia/Kolkata",
        hour: "numeric",
        hour12: false,
      }).format(new Date())
    );

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

    const browserInfo = parser.getBrowser();

    const osInfo = parser.getOS();

    const newLogin = {

      browser,

      browserVersion:
        browserInfo.version || "",

      os,

      osVersion:
        osInfo.version || "",

      device,

      ip,

      loginTime: new Date(),

    };

    const lastLogin =
      exisitinguser.loginHistory[
      exisitinguser.loginHistory.length - 1
      ];

    if (

      lastLogin &&

      lastLogin.browser === newLogin.browser &&

      lastLogin.browserVersion === newLogin.browserVersion &&

      lastLogin.os === newLogin.os &&

      lastLogin.osVersion === newLogin.osVersion &&

      lastLogin.device === newLogin.device &&

      lastLogin.ip === newLogin.ip

    ) {

      lastLogin.loginTime =
        new Date();

    } else {

      exisitinguser.loginHistory.push(
        newLogin
      );

    }

    if (
      exisitinguser.loginHistory.length > 5
    ) {

      exisitinguser.loginHistory =
        exisitinguser.loginHistory.slice(-5);

    }

    await exisitinguser.save();
    const token = jwt.sign(
      { email: exisitinguser.email, id: exisitinguser._id },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
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
export const updateLanguage = async (req, res) => {

  const { id } = req.params;

  const { language } = req.body;

  try {

    const existingUser =
      await user.findById(id);

    if (!existingUser) {

      return res.status(404).json({
        message: "User not found"
      });

    }

    existingUser.pendingLanguage =
      language;

    // French → Email OTP
    if (language === "French") {

      const otp =
        generateOTP();

      existingUser.languageOTP =
        otp;

      existingUser.languageOTPExpiry =
        new Date(
          Date.now() +
          5 * 60 * 1000
        );

      await existingUser.save();

      await sendLanguageOTP(
        existingUser.email,
        otp
      );

      return res.status(200).json({

        otpRequired: true,

        method: "email",

        message:
          "OTP sent to email"

      });

    }

    // Other Languages → Mobile OTP
    if (!existingUser.mobileVerified) {

      return res.status(400).json({

        message:
          "Please verify your mobile number first."

      });

    }

    const otp =
      generateOTP();

    existingUser.languageOTP =
      otp;

    existingUser.languageOTPExpiry =
      new Date(
        Date.now() +
        5 * 60 * 1000
      );

    await existingUser.save();

    await sendSMS(

      existingUser.phoneNumber,

      `Your mobile OTP is ${otp}`

    );

    return res.status(200).json({

      otpRequired: true,

      method: "mobile",

      message:
        "OTP sent successfully"

    });

  }

  catch (error) {

    console.log(error);

    res.status(500).json({

      message:
        "something went wrong.."

    });

  }

};

export const verifyMobileLanguageOTP = async (req, res) => {

  const { id } = req.params;

  const { otp } = req.body;

  try {

    const existingUser =
      await user.findById(id);

    if (!existingUser) {

      return res.status(404).json({

        message:
          "User not found"

      });

    }

    if (

      String(existingUser.languageOTP)

      !==

      String(otp)

    ) {

      return res.status(400).json({

        message:
          "Invalid OTP"

      });

    }

    if (

      new Date()

      >

      existingUser.languageOTPExpiry

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

  }

  catch (error) {

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
export const createOrder = async (req, res) => {
  try {

    const now = new Date();
    const indiaDate = new Date(
      now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
    );
    const indiaHour = indiaDate.getHours();


    if (false) {
      return res.status(403).json({
        message: "Payments are allowed only between 10:00 AM and 11:00 AM IST.",
      });
    }

    const { amount } = req.body;

    const order = await razorpay.orders.create({
      amount: amount * 100,
      currency: "INR",
    });

    res.status(200).json(order);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Order creation failed",
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
      const parser = new UAParser(
        req.headers["user-agent"]
      );

      const browserInfo =
        parser.getBrowser();

      const osInfo =
        parser.getOS();

      const deviceInfo =
        parser.getDevice();

      const browser =
        browserInfo.name || "Unknown";

      const browserVersion =
        browserInfo.version || "";

      const os =
        osInfo.name || "Unknown";

      const osVersion =
        osInfo.version || "";

      const device =
        deviceInfo.type || "Desktop";

      const ip =
        req.headers["x-forwarded-for"]?.split(",")[0] ||
        req.socket.remoteAddress ||
        req.ip ||
        "Unknown";

      const newLogin = {

        browser,

        browserVersion,

        os,

        osVersion,

        device,

        ip,

        loginTime: new Date(),

      };

      const lastLogin =
        existingUser.loginHistory[
        existingUser.loginHistory.length - 1
        ];

      if (

        lastLogin &&

        lastLogin.browser === newLogin.browser &&

        lastLogin.browserVersion === newLogin.browserVersion &&

        lastLogin.os === newLogin.os &&

        lastLogin.osVersion === newLogin.osVersion &&

        lastLogin.device === newLogin.device &&

        lastLogin.ip === newLogin.ip

      ) {

        lastLogin.loginTime =
          new Date();

      } else {

        existingUser.loginHistory.push(
          newLogin
        );

      }

      if (
        existingUser.loginHistory.length > 5
      ) {

        existingUser.loginHistory =
          existingUser.loginHistory.slice(-5);

      }
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
            expiresIn: "30d"
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

    // --- NEW: PREMIUM UX LOGIC FOR ACTIVE OTP ---
    if (
      existingUser.forgotPasswordOTP &&
      existingUser.forgotPasswordOTPExpiry &&
      new Date() < new Date(existingUser.forgotPasswordOTPExpiry)
    ) {
      return res.status(400).json({
        success: false,
        otpAlreadySent: true,
        message: "A password reset code has already been sent to your email. Please use the existing code or wait until it expires."
      });
    }
    // --------------------------------------------

    const otp = generateOTP();

    existingUser.forgotPasswordOTP = otp;
    existingUser.forgotPasswordOTPExpiry = new Date(
      Date.now() + 5 * 60 * 1000
    );

    await existingUser.save();

    await sendForgotPasswordOTP(
      existingUser.email,
      otp
    );

    return res.status(200).json({
      otpRequired: true,
      message: "OTP sent to email"
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "something went wrong..",
    });
  }
};
export const verifyForgotPasswordOTP =
  async (req, res) => {

    const { email, otp } =
      req.body;

    const existingUser =
      await user.findOne({
        email
      });

    if (
      existingUser
        .forgotPasswordOTP !== otp
    ) {

      return res.status(400).json({
        message:
          "Invalid OTP"
      });

    }

    if (
      new Date() >
      existingUser
        .forgotPasswordOTPExpiry
    ) {

      return res.status(400).json({
        message:
          "OTP expired"
      });

    }

    const newPassword =
      generateRandomPassword();

    const hashedPassword =
      await bcrypt.hash(
        newPassword,
        12
      );

    existingUser.password =
      hashedPassword;

    existingUser.forgotPasswordLastUsed =
      new Date();

    existingUser.forgotPasswordOTP =
      "";

    existingUser
      .forgotPasswordOTPExpiry =
      null;

    await existingUser.save();

    await sendNewPasswordEmail(
      existingUser.email,
      newPassword
    );

    res.status(200).json({

      message:
        "Password reset successful",

      newPassword

    });

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

    sender.sentRequests.push(receiverId);

    await receiver.save();

    await sender.save();

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
        id => id.toString() !== senderId.toString()
      );

    sender.sentRequests =
      sender.sentRequests.filter(
        id => id.toString() !== userId.toString()
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
export const getFriendRequests = async (req, res) => {
  const { userId } = req.params;

  try {
    const currentUser = await user.findById(userId);

    if (!currentUser) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    const requests = await user.find({
      _id: { $in: currentUser.friendRequests }
    });

    res.status(200).json({
      data: requests
    });

  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Something went wrong"
    });
  }
};
export const rejectFriendRequest = async (req, res) => {
  const { userId, senderId } = req.body;

  try {
    const currentUser = await user.findById(userId);

    if (!currentUser) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    currentUser.friendRequests =
      currentUser.friendRequests.filter(
        (id) => id !== senderId
      );

    await currentUser.save();

    res.status(200).json({
      message: "Friend request rejected"
    });

  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Something went wrong"
    });
  }
};
export const getPaymentStatus = async (req, res) => {
  try {
    const now = new Date();

    const indiaDate = new Date(
      now.toLocaleString("en-US", {
        timeZone: "Asia/Kolkata",
      })
    );

    const currentHour = indiaDate.getHours();
    const currentMinute = indiaDate.getMinutes();
    const currentSecond = indiaDate.getSeconds();

    const currentSeconds =
      currentHour * 3600 +
      currentMinute * 60 +
      currentSecond;

    const paymentStart = 10 * 3600; // 10:00 AM
    const paymentEnd = 11 * 3600;   // 11:00 AM

    const isPaymentWindowOpen =
      currentSeconds >= paymentStart &&
      currentSeconds < paymentEnd;

    let countdown = 0;

    if (isPaymentWindowOpen) {
      countdown = paymentEnd - currentSeconds;
    } else if (currentSeconds < paymentStart) {
      countdown = paymentStart - currentSeconds;
    } else {
      countdown =
        86400 -
        currentSeconds +
        paymentStart;
    }

    res.status(200).json({
      isPaymentWindowOpen,
      countdown,
      currentTime: indiaDate,
    });

  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Something went wrong",
    });
  }
};
export const sendMobileOTP = async (req, res) => {

  const { userId, phoneNumber } = req.body;

  try {

    const currentUser =
      await user.findById(userId);

    if (!currentUser) {

      return res.status(404).json({
        message: "User not found"
      });

    }

    const otp =
      generateOTP();

    const expiry =
      new Date(
        Date.now() +
        5 * 60 * 1000
      );

    currentUser.phoneNumber =
      phoneNumber;

    currentUser.mobileOTP =
      otp;

    currentUser.mobileOTPExpiry =
      expiry;

    currentUser.mobileVerified =
      false;

    await currentUser.save();
    await sendSMS(
      phoneNumber,
      `Your mobile OTP is ${otp}`
    );

    res.status(200).json({

      message:
        "OTP sent successfully"

    });

  }

  catch (error) {

    console.log(error);

    res.status(500).json({

      message:
        "Failed to send OTP"

    });

  }

};
export const verifyMobileOTP = async (req, res) => {

  const { userId, otp } = req.body;

  try {

    const currentUser =
      await user.findById(userId);

    if (!currentUser) {

      return res.status(404).json({

        message:
          "User not found"

      });

    }

    if (currentUser.mobileVerified) {

      return res.status(400).json({

        message:
          "Mobile number is already verified."

      });

    }

    if (!currentUser.mobileOTP) {

      return res.status(400).json({

        message:
          "Please request an OTP first."

      });

    }

    if (

      new Date()

      >

      currentUser.mobileOTPExpiry

    ) {

      return res.status(400).json({

        message:
          "OTP has expired."

      });

    }

    if (

      String(currentUser.mobileOTP)

      !==

      String(otp)

    ) {

      return res.status(400).json({

        message:
          "Invalid OTP."

      });

    }

    currentUser.mobileVerified =
      true;

    currentUser.mobileOTP =
      "";

    currentUser.mobileOTPExpiry =
      null;

    await currentUser.save();

    res.status(200).json({

      message:
        "Mobile number verified successfully."

    });

  }

  catch (error) {

    console.log(error);

    res.status(500).json({

      message:
        "Something went wrong."

    });

  }

};