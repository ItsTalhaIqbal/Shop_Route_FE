"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { isLogin, logOut } from "@/utils/Auth";
import { useRouter } from "next/navigation";
import Cart from "./cart";
import { useEffect, useState } from "react";
import Link from "next/link";

const Navbar: React.FC = () => {
  const router = useRouter();
  const [userPath, setUserPath] = useState("");

  useEffect(() => {
    const checkUserRole = async () => {
      const user = await isLogin();
      user.role == "admin"
        ? setUserPath("/admin/profile")
        : setUserPath("/salesman/profile");
    };
    checkUserRole()
  }, []);

  return (
    <header className={"bg-black border-b-1 "}>
      <div className="flex items-center justify-between p-4 mx-auto w-full">
        <nav className="flex items-center w-full justify-end">
          {/* <Cart /> */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="text-lg bg-white text-black rounded-sm"
              >
                Profile <span className="ml-2">▼</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-black text-white shadow-lg rounded-lg">
              <DropdownMenuItem className="text-lg">
                <Link href={userPath}>View Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuItem className="text-lg">
                <Button
                  variant="link"
                  className="text-white w-full text-left"
                  onClick={() => {
                    logOut();
                    router.push("/login");
                  }}
                >
                  Logout
                </Button>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
