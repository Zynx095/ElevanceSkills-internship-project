import express from "express";
import {
  getallusers,
  Login,
  Signup,
  updateprofile,
  transferPoints,
  forgotPassword,
  sendFriendRequest,
  acceptFriendRequest,
  updateSubscription,
  updateLanguage,
  verifyLanguageOTP,
  verifyLoginOTP
} from "../controller/auth.js";

const router = express.Router();
import auth from "../middleware/auth.js";
router.post("/forgot-password", forgotPassword);
router.post("/signup", Signup);
router.post("/login", Login);
router.post("/send-friend-request", auth, sendFriendRequest);
router.post("/accept-friend-request", auth, acceptFriendRequest);
router.get("/getalluser", getallusers);
router.patch("/update/:id", auth, updateprofile);
router.patch("/subscription/:id", auth, updateSubscription);
router.patch("/language/:id", auth, updateLanguage);
router.post(
  "/verify-login-otp",
  verifyLoginOTP
);
router.post(
  "/verify-language-otp/:id",
  auth,
  verifyLanguageOTP
);
router.post(
  "/transfer-points",
  auth,
  (req, res, next) => {
    console.log("TRANSFER ROUTE HIT");
    next();
  },
  transferPoints
);

export default router;