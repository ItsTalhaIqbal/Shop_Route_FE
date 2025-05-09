"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { baseURL } from "@/utils/baseURL";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";



type user={
  username:string,
  email:string,
  password:string,
  role: "admin" | "salesman",

}

const RegisterForm :React.FC = () => {
  const [username, setUsername] = useState<String>("");
  const [password, setPassword] = useState<String>("");
  const [email, setEmail] = useState<String>("");
  const [users, setUsers] = useState<user[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<String>("");

  useEffect(() => {
    const fetchUsers = async () => {
      const res = await axios.get(`${baseURL}/api/user`);
      setUsers(res.data.response);
    };
    fetchUsers();
  }, []);

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!username.trim() || !email || !password.trim) {
      alert("All fields are required!");
      setLoading(false);
      return;
    }

    if(username.trim().length < 3){
      setError("username must be atleast 3 cheracters long")
      setLoading(false)
      return
    }

    if (password.trim().length < 8) {
      setError("Password must be atleast 8  cheracters long ");
      setLoading(false)
      return;
    }
    const duplicateUser = users.find(
      (user) => user.username == username && user.email == email
    );
    if (duplicateUser) {
      alert("UserName and Email Already Taken");
      setLoading(false)
      return;
    }
    try {
   
      const res = await axios.post(`${baseURL}/api/auth/register`, { username, email, password });

      setPassword("");
      setUsername("");
      setEmail("");
      alert("Account Created Successfully, Please Login!");
      router.push("/login");
    } catch (error: any) {
      setError(
        error?.response?.data?.message || "Registration failed. Try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-200 h-auto w-[400px] rounded-lg p-10">
      <h1 className="text-2xl font-bold text-gray-700 mb-4 text-center">
        Create New Account
      </h1>

      {error && <p className="text-red-500 mb-4 text-center">{error}</p>}

      <form onSubmit={handleSubmit}>
        <Input
          type="text"
          className="my-5"
          value={username}
          placeholder="Enter username"
          onChange={(e) => setUsername(e.target.value)}
          aria-label="Username"
        />
        <Input
          type="email"
          className="my-5"
          value={email}
          placeholder="Enter Email"
          onChange={(e) => setEmail(e.target.value)}
          aria-label="Email"
        />
        <Input
          type="password"
          className="my-5"
          value={password}
          placeholder="Enter Password"
          onChange={(e) => setPassword(e.target.value)}
          aria-label="Password"
        />
        <Button
          disabled={loading}
          type="submit"
          className="bg-gray-700 rounded-sm text-white w-full mt-5 mb-8"
        >
          {loading ? "Registering..." : "Register"}
        </Button>
        <Link href={"/login"} className="text-blue-600 text-center block">
          Already Have An Account?
        </Link>
      </form>
    </div>
  );
};

export default RegisterForm;
