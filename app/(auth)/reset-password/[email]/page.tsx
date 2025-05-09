"use client";

import { useRouter, useParams } from "next/navigation";
import { useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { baseURL } from "@/utils/baseURL";

const ResetPasswordPage = () => {
  const { email } = useParams();
  const router = useRouter();


  const decodedEmail = email ? decodeURIComponent(email as string) : "";

  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [error,setError]=useState<String>("")

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    if(!decodedEmail && !code && !password){
      alert("Please enter code and password")
      return;
    }
    const CheckPass  = password.trim().split("")
    if (CheckPass.length < 8) {
      setError("Password must be atleast 8  cheracters long ");
      setLoading(false)
      return;
    }
    try {
      const res = await axios.post(`${baseURL}/api/reset/reset`, { email: decodedEmail, code, password });
      setSuccessMsg(res.data.message || "Password reset successfully!");
      router.push('/login');
    } catch (error: any) {
      setErrorMsg(error.response?.data?.message || "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-500 h-screen flex justify-center items-center">
      <div className="bg-white p-10 rounded-lg shadow-lg w-full max-w-sm">
        <h1 className="text-2xl font-bold text-gray-700 mb-6 text-center">
          Reset Password for {decodedEmail || "Loading..."}

          {error && <p className="text-red-500 font-semibold my-4">{error}</p>}
        </h1>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <Input
              type="text"
              value={code}
              placeholder="Enter your reset code"
              onChange={(e) => setCode(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <Input
              type="password"
              value={password}
              placeholder="Enter your new password"
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {errorMsg && (
            <p className="text-red-600 text-sm text-center mb-2">{errorMsg}</p>
          )}
          {successMsg && (
            <p className="text-green-600 text-sm text-center mb-2">{successMsg}</p>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="bg-gray-700 text-white w-full py-2 rounded-md"
          >
            {loading ? "Resetting Password..." : "Reset Password"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
