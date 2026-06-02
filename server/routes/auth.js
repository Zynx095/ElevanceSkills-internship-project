import express from "express";
import {
  getallusers,
  Login,
  Signup,
  updateprofile,
  transferPoints
} from "../controller/auth.js";

const router = express.Router();
import auth from "../middleware/auth.js";

router.post("/signup", Signup);
router.post("/login", Login);
router.get("/getalluser", getallusers);
router.patch("/update/:id", auth, updateprofile);

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