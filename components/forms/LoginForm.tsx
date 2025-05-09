"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { setAuthentication, isLogin } from "@/utils/Auth";
import { baseURL } from "@/utils/baseURL";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const LoginForm = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    if (!username.trim() || !password) {
      setErrorMsg("please enter username and password")
      setLoading(false);
      return;
    }
    

    try {
      const data = { username, password };
      const res = await axios.post(`${baseURL}/api/auth/login`, data);
      const token = res.data.token;

      await setAuthentication(token);
      const user = await isLogin();
      setRedirecting(true);
      if (user?.role === "admin") {
        router.push("/admin");
      } else if (user?.role === "salesman") {
        router.push("/salesman");
      } else {
        router.push("/");
      }

      setPassword("");
      setUsername("");
      setErrorMsg("")
    } catch (error: any) {
      setErrorMsg("Invalid username or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-200 h-[440px] w-[400px] rounded-lg p-10">
      <h1 className="text-2xl font-bold text-gray-700 mb-4 text-center">
        Login to Your Account
      </h1>

      <form onSubmit={handleSubmit}>
        <Input
          className="my-5"
          value={username}
          placeholder="Enter username"
          onChange={(e) => setUsername(e.target.value)}
        />
        <Input
          className="my-5"
          type="password"
          value={password}
          placeholder="Enter Password"
          onChange={(e) => setPassword(e.target.value)}
        />

        {errorMsg && (
          <p className="text-red-600 text-sm text-center mb-2">{errorMsg}</p>
        )}

        <Link href={"reset-password"} className="ml-20 text-blue-600 text-sm">
          Forgot Your Password?
        </Link>

        <Button
          type="submit"
          disabled={loading || redirecting}
          className="bg-gray-700 rounded-sm text-white w-full mt-3 mb-8"
        >
          {loading || redirecting ? "Processing..." : "Login"}
        </Button>

        <Link href={"/register"} className="ml-20 text-blue-600 mt-7">
          Create new Account!
        </Link>
      </form>
    </div>
  );
};

export default LoginForm;
