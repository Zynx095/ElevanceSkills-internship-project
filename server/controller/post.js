import Post from "../models/post.js";

export const createPost =
  async (req, res) => {

    try {

      const post =
        new Post(req.body);

      await post.save();

      res.status(200).json({
        data: post
      });

    } catch (error) {

      console.log(error);

      res.status(500).json({
        message:
          "something went wrong"
      });

    }

  };

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