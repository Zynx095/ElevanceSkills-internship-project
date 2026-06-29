import Post from "../models/post.js";
import User from "../models/auth.js";
export const createPost =
  async (req, res) => {

    try {

      const currentUser =
        await User.findById(
          req.body.userId
        );

      if (!currentUser) {

        return res.status(404)
          .json({
            message:
              "User not found"
          });

      }

      const friendCount =
        currentUser.friends?.length || 0;

      let dailyLimit = 0;

      if (friendCount === 0) {
        return res.status(403).json({
          message:
            "You need at least 1 friend to post on the public feed."
        });
      }

      else if (friendCount === 1)
        dailyLimit = 1;

      else if (friendCount === 2)
        dailyLimit = 2;

      else if (friendCount > 10)
        dailyLimit = Infinity;

      else
        dailyLimit = friendCount;

      const today =
        new Date();

      today.setHours(
        0,
        0,
        0,
        0
      );

      const postsToday =
        await Post.countDocuments({
          userId:
            req.body.userId,
          createdAt: {
            $gte: today
          }
        });

      if (
        dailyLimit !== Infinity &&
        postsToday >= dailyLimit
      ) {

        return res.status(403)
          .json({
            message:
              `Feed posting limit reached (${isUnlimited ? "Unlimited" : dailyLimit}/day)`
          });

      }

      const post =
        new Post(
          req.body
        );

      await post.save();

      res.status(200)
        .json({
          data: post
        });

    } catch (error) {

      console.log(error);

      res.status(500)
        .json({
          message:
            "something went wrong"
        });

    }

  };
export const getPostStatus = async (req, res) => {

  const { userId } = req.params;

  try {

    const currentUser = await User.findById(userId);

    if (!currentUser) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    const friendCount =
      currentUser.friends.length;

    let limit = 0;

    if (friendCount === 0)
      limit = 0;
    else if (friendCount > 10)
      limit = Infinity;
    else
      limit = friendCount;

    const today = new Date();

    today.setHours(0, 0, 0, 0);

    const postsToday =
      await Post.countDocuments({

        userId,

        createdAt: {
          $gte: today
        }

      });

    const unlimited = friendCount > 10;

    res.json({
      friends: friendCount,
      used: postsToday,
      limit: unlimited ? -1 : limit,
      remaining: unlimited
        ? -1
        : Math.max(0, limit - postsToday),
      unlimited
    });

  }

  catch (err) {

    console.log(err);

    res.status(500).json({
      message: "Something went wrong"
    });

  }

}

export const getAllPosts =
  async (req, res) => {

    try {

      const posts =
        await Post.find()
          .sort({
            createdAt: -1
          });

      res.status(200).json({
        data: posts
      });

    } catch (error) {

      console.log(error);

      res.status(500).json({
        message:
          "something went wrong"
      });

    }

  };
export const likePost =
  async (req, res) => {

    const { postId } =
      req.params;

    const { userId } =
      req.body;

    try {

      const post =
        await Post.findById(
          postId
        );

      if (!post) {

        return res.status(404)
          .json({
            message:
              "Post not found"
          });

      }

      if (
        post.likes.includes(
          userId
        )
      ) {

        post.likes =
          post.likes.filter(
            (id) =>
              id !== userId
          );

      } else {

        post.likes.push(
          userId
        );

      }

      await post.save();

      res.status(200).json({
        likes:
          post.likes.length
      });

    } catch (error) {

      console.log(error);

      res.status(500).json({
        message:
          "something went wrong"
      });

    }

  };
export const commentPost =
  async (req, res) => {

    const { postId } =
      req.params;

    const {
      userId,
      userName,
      comment
    } = req.body;

    try {

      const post =
        await Post.findById(
          postId
        );

      if (!post) {

        return res.status(404)
          .json({
            message:
              "Post not found"
          });

      }

      post.comments.push({
        userId,
        userName,
        comment
      });

      await post.save();

      res.status(200).json({
        comments:
          post.comments
      });

    } catch (error) {

      console.log(error);

      res.status(500).json({
        message:
          "something went wrong"
      });

    }

  };
export const sharePost =
  async (req, res) => {

    const { postId } =
      req.params;

    try {

      const post =
        await Post.findById(
          postId
        );

      if (!post) {

        return res.status(404)
          .json({
            message:
              "Post not found"
          });

      }

      post.shareCount += 1;

      await post.save();

      res.status(200).json({
        shareCount:
          post.shareCount
      });

    } catch (error) {

      console.log(error);

      res.status(500).json({
        message:
          "something went wrong"
      });

    }

  };
export const deletePost =
  async (req, res) => {

    const { postId } =
      req.params;

    try {

      await Post.findByIdAndDelete(
        postId
      );

      res.status(200).json({
        message:
          "Post deleted"
      });

    } catch (error) {

      console.log(error);

      res.status(500).json({
        message:
          "something went wrong"
      });

    }

  };