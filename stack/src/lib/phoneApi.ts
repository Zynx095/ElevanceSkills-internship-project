import axiosInstance from "./axiosinstance";

export const sendMobileOTP = async (
    userId: string,
    phoneNumber: string
) => {

    const res = await axiosInstance.post(
        "/user/send-mobile-otp",
        {
            userId,
            phoneNumber
        }
    );

    return res.data;

};

export const verifyMobileOTP = async (
    userId: string,
    otp: string
) => {

    const res = await axiosInstance.post(
        "/user/verify-mobile-otp",
        {
            userId,
            otp
        }
    );

    return res.data;

};