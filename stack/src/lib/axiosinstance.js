import axios from "axios";
import { toast } from "react-toastify";

const axiosInstance = axios.create({

  baseURL:

    process.env.NEXT_PUBLIC_API_URL ||

    "http://localhost:5000",

  headers: {

    "Content-Type":
      "application/json",

  },

});

axiosInstance.interceptors.request.use((req) => {
  if (typeof window !== "undefined") {
    const user = localStorage.getItem("user");

    if (user) {
      const token = JSON.parse(user).token;

      if (token) {
        req.headers.Authorization = `Bearer ${token}`;
      }
    }
  }

  return req;
});

axiosInstance.interceptors.response.use(

  (response) => response,

  (error) => {

    if (
      error.response &&
      error.response.status === 401
    ) {

      localStorage.removeItem("user");

      toast.error(
        "Session expired. Please login again."
      );

      window.location.href = "/login";
    }

    return Promise.reject(error);
  }

);

export default axiosInstance;