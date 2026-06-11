import axiosInstance from "./axiosinstance";

export const getPosts = async () => {
  const res =
    await axiosInstance.get(
      "/post/all"
    );

  return res.data.data;
};

export const createPost =
  async (postData) => {

    const res =
      await axiosInstance.post(
        "/post/create",
        postData
      );

    return res.data;
  };

export const likePost =
  async (
    postId,
    userId
  ) => {

    const res =
      await axiosInstance.patch(
        `/post/like/${postId}`,
        { userId }
      );

    return res.data;
  };

export const commentPost =
  async (
    postId,
    commentData
  ) => {

    const res =
      await axiosInstance.post(
        `/post/comment/${postId}`,
        commentData
      );

    return res.data;
  };

export const sharePost =
  async (postId) => {

    const res =
      await axiosInstance.patch(
        `/post/share/${postId}`
      );

    return res.data;
  };

export const deletePost =
  async (postId) => {

    const res =
      await axiosInstance.delete(
        `/post/delete/${postId}`
      );

    return res.data;
  };