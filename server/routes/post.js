import express from "express";

import {
  createPost,
  getAllPosts,
  likePost,
  commentPost,
  sharePost,
  deletePost,
  getPostStatus
} from "../controller/post.js";

import auth from "../middleware/auth.js";

const router =
  express.Router();

router.post(
  "/create",
  auth,
  createPost
);
router.get(
"/status/:userId",
auth,
getPostStatus
);
router.get(
  "/all",
  getAllPosts
);
router.patch(
  "/like/:postId",
  auth,
  likePost
);
router.post(
  "/comment/:postId",
  auth,
  commentPost
);
router.patch(
  "/share/:postId",
  auth,
  sharePost
);
router.delete(
  "/delete/:postId",
  auth,
  deletePost
);
export default router;