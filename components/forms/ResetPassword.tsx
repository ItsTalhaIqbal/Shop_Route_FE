"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { baseURL } from "@/utils/baseURL";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const ResetPasswordForm = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    if (!email) {
      alert("Email is required");
      return;
    }
    
    try {
      const res = await axios.post(`${baseURL}/api/reset/requestReset`, {
        email,
      });
      setSuccessMsg(
        res.data.message || "Password reset link sent to your email."
      );
      router.push(`/reset-password/${email}`);
    } catch (error: any) {
      alert("Error resetting password")
      setErrorMsg(
        error.response?.data?.message || "An error occurred. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-200 h-[400px] w-[400px] rounded-lg p-10 shadow-lg">
      <h1 className="text-2xl font-bold text-gray-700 mb-6 text-center">
        Reset Password
      </h1>

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <Input
            type="email"
            value={email}
            placeholder="Enter your email"
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        {errorMsg && (
          <p className="text-red-600 text-sm text-center mb-2">{errorMsg}</p>
        )}
        {successMsg && (
          <p className="text-green-600 text-sm text-center mb-2">
            {successMsg}
          </p>
        )}

        <Button
          type="submit"
          disabled={loading}
          className="bg-gray-700 text-white w-full py-2 rounded-md"
        >
          {loading ? "Resetting Password..." : "Reset Password"}
        </Button>
      </form>

      <div className="text-center mt-6">
        <p className="text-sm">
          Remembered your password?
          <Link href="/login" className="text-blue-600 font-medium">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ResetPasswordForm;
