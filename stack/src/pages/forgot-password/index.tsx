import React, { useState } from "react";
import axiosInstance from "@/lib/axiosinstance";
import { toast } from "react-toastify";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [generatedPassword, setGeneratedPassword] = useState("");

  const handleForgotPassword = async () => {
    try {
      const res = await axiosInstance.post(
        "/user/forgot-password",
        {
          email,
        }
      );

      setGeneratedPassword(
        res.data.newPassword
      );

      toast.success(
        "Password reset successful"
      );
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          "Reset failed"
      );
    }
  };

  return (
    <div className="flex justify-center mt-10">
      <Card className="w-full max-w-md">
        <CardContent className="space-y-4 pt-6">
          <h1 className="text-2xl font-bold">
            Forgot Password
          </h1>

          <Input
            placeholder="Enter Email"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
          />

          <Button
            onClick={handleForgotPassword}
            className="w-full"
          >
            Reset Password
          </Button>

          {generatedPassword && (
            <div className="border p-3 rounded">
              <p className="font-semibold">
                New Password:
              </p>
              <p>{generatedPassword}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ForgotPassword;