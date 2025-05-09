"use client";

import React, { useEffect, useState } from "react";
import { ShoppingCart } from "lucide-react" // Importing ShoppingCart icon
import { useSelector } from "react-redux";
import Link from "next/link";
import { usePathname } from "next/navigation";

const Cart: React.FC = () => {
  // const cart = useSelector((state: RootState) => state.cart?.items || []) as CartItem[];
  // const [isClient, setIsClient] = useState(false);
  // const pathName = usePathname();
  // useEffect(() => {
  //   setIsClient(true);
  // }, []);

  // if (!isClient) {
  //   return null; 
  // }

  return (
    <div className="relative">
{/*       <div
        className={`${
          pathName.includes("/cart") ? "hidden" : ""
        } rounded-full h-9 w-9 cart mt-2 mr-3 flex items-center justify-center`}
      >
        <Link href="/salesman/cart">
          <ShoppingCart size={20} className="text-white" /> 
        </Link>
        {cart.length !== 0 && (
          <div className="bg-white absolute top-1 right-1 mb-1 w-6 h-6 text-center rounded-lg p-0 font-semibold">
            {cart.length}
          </div>
        )}
      </div> */}
    </div>
  );
};

export default Cart;
