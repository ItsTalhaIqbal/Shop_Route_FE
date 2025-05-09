'use client';
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isLogin } from "@/utils/Auth";

const Page = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkRole = async () => {
      const user = await isLogin();

      if (user?.role !== "admin") {
        router.push("/login"); 
      } else {
        setLoading(false);
      }
    };

    checkRole();
  }, []);

  if (loading) return <div>Loading...</div>;

  return <div>Dashboard</div>;
};

export default Page;
