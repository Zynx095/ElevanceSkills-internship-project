import express from "express";
import { sendEmail } from "../utils/emailService.js";
import {
  getallusers,
  Login,
  Signup,
  updateprofile,
  transferPoints,
  forgotPassword,
  sendFriendRequest,
  acceptFriendRequest,
  getFriendRequests,
  rejectFriendRequest,
  updateSubscription,
  createOrder,
  updateLanguage,
  verifyLanguageOTP,
  verifyLoginOTP,
  verifyForgotPasswordOTP,
  verifyMobileLanguageOTP,
  getPaymentStatus,
  sendMobileOTP,
  verifyMobileOTP
} from "../controller/auth.js";
import {
  sendLanguageOTP
}
  from "../utils/sendLanguageOTP.js";
const router = express.Router();
import auth from "../middleware/auth.js";
router.post("/forgot-password", forgotPassword);
router.post("/signup", Signup);
router.post("/login", Login);
router.post(
  "/send-request",
  auth,
  sendFriendRequest
);
router.get("/test-email", async (req, res) => {
  try {
    await sendEmail({
      to: "yukithj@gmail.com",
      subject: "Resend Test",
      html: "<h1>Resend is working!</h1>",
    });

    res.json({
      success: true,
      message: "Email sent",
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});
router.post(
    "/verify-mobile-otp",
    auth,
    verifyMobileOTP
);
router.get(
  "/payment-status",
  getPaymentStatus
);
router.patch(
  "/accept-request",
  auth,
  acceptFriendRequest
);

router.get(
  "/friend-requests/:userId",
  auth,
  getFriendRequests
);
router.post(
  "/send-mobile-otp",
  auth,
  sendMobileOTP
);
router.patch(
  "/reject-request",
  auth,
  rejectFriendRequest
);

router.get("/getalluser", getallusers);
router.patch("/update/:id", auth, updateprofile);
router.patch("/subscription/:id", auth, updateSubscription);
router.patch("/language/:id", auth, updateLanguage);
router.post(
  "/verify-forgot-password-otp",
  verifyForgotPasswordOTP
);
router.post(
  "/verify-login-otp",
  verifyLoginOTP
);
router.post(
  "/verify-language-otp/:id",
  auth,
  verifyLanguageOTP
);

router.post("/verify-mobile-language/:id", auth, verifyMobileLanguageOTP);
router.post(
  "/transfer-points",
  auth,
  (req, res, next) => {
    console.log("TRANSFER ROUTE HIT");
    next();
  },
  transferPoints
);
router.post(
  "/create-order",
  auth,
  createOrder
);

export default router;
