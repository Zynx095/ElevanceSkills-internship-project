import { useState } from "react";
import { createContext } from "react";
import axiosInstance from "./axiosinstance";
import { toast } from "react-toastify";
import { useContext } from "react";
import Link from "next/link";
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("user");
      return stored ? JSON.parse(stored) : null;
    }
    return null;
  });
  const [loading, setloading] = useState(false);
  const [error, seterror] = useState(null);

  const Signup = async ({ name, email, password }) => {
    setloading(true);
    seterror(null);
    try {
      const res = await axiosInstance.post("/user/signup", {
        name,
        email,
        password,
      });
      const { data, token } = res.data;
      localStorage.setItem("user", JSON.stringify({ ...data, token }));
      setUser(data);
      toast.success("Signup Successful");
    } catch (error) {
      const msg = error.response?.data.message || "Signup failed";
      seterror(msg);
      toast.error(msg);
    }
  };
  const Login = async ({
    email,
    password
  }) => {

    setloading(true);
    seterror(null);

    try {

      const res =
        await axiosInstance.post(
          "/user/login",
          {
            email,
            password
          }
        );

      if (
        res.data.otpRequired
      ) {

        toast.success(
          "OTP Generated. Check terminal."
        );

        return {
          otpRequired: true,
          email: res.data.email
        };
      }

      const {
        data,
        token
      } = res.data;

      localStorage.setItem(
        "user",
        JSON.stringify({
          ...data,
          token
        })
      );

      setUser(data);

      toast.success(
        "Login Successful"
      );
      return {
        otpRequired: false
      };

    } catch (error) {

      const msg =
        error.response?.data.message ||
        "Login failed";

      seterror(msg);

      toast.error(msg);

    }

  };
  const Logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    toast.info("Logged out");
  };
  return (
    <AuthContext.Provider
      value={{ user,setUser, Signup, Login, Logout, loading, error }}
    >
      {children}
    </AuthContext.Provider>
  );
};
export const useAuth = () => useContext(AuthContext);
