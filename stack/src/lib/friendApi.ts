import axiosInstance from "./axiosinstance";

export const sendFriendRequest = async (
  senderId: string,
  receiverId: string
) => {
  const res = await axiosInstance.post(
    "/user/send-request",
    {
      senderId,
      receiverId
    }
  );

  return res.data;
};

export const getFriendRequests = async (
  userId: string
) => {
  const res = await axiosInstance.get(
    `/user/friend-requests/${userId}`
  );

  return res.data;
};

export const acceptFriendRequest = async (
  userId: string,
  senderId: string
) => {
  const res = await axiosInstance.patch(
    "/user/accept-request",
    {
      userId,
      senderId
    }
  );

  return res.data;
};
export const rejectFriendRequest = async (
    userId: string,
    senderId: string
) => {

    const res = await axiosInstance.patch(
        "/user/reject-request",
        {
            userId,
            senderId
        }
    );

    return res.data;
};