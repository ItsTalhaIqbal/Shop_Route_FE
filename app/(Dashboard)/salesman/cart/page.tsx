"use client";

import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { baseURL } from "@/utils/baseURL";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  clearCart,
  decrementQuantity,
  incrementQuantity,
  removeFromCart,
} from "@/redux/cartSlice";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { isLogin } from "@/utils/Auth";

const CartPage = () => {
  const cart = useSelector((state: any) => state.cart.items);
  const dispatch = useDispatch();
  const router = useRouter();

  const [city, setCity] = useState<string>("");
  const [area, setArea] = useState<string>("");
  const [shopId, setShopId] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<string>("cod");
  const [loading, setLoading] = useState(false);
  const [isClient, setIsClient] = useState<boolean>(false);
  const [shops, setShops] = useState<any>([]);
  const [cities, setCities] = useState<any>([]);
  const [areas, setAreas] = useState<any>([]);
  const [filteredAreas, setFilteredAreas] = useState<any>([]);
  const [filteredShops, setFilteredShops] = useState<any>([]);
  const [userDetails, setUserDetails] = useState<{
    name: string;
    email: string;
  } | null>(null);

  useEffect(() => {
    const checkRole = async () => {
      const user = await isLogin();

      if (user?.role !== "salesman") {
        router.push("/login");
      } else {
        setLoading(false);
      }
    };

    checkRole();
  }, []);

  useEffect(() => {
    setIsClient(true);

    const userData = localStorage.getItem("user");
    if (userData) {
      setUserDetails(JSON.parse(userData));
    }

    axios
      .get(`${baseURL}/api/shop`)
      .then((response) => setShops(response.data.response))
        
      .catch((error) =>  alert("Error fetching Shops"));

    axios
      .get(`${baseURL}/api/city`)
      .then((response) => setCities(response.data.response))
       
      .catch((error) =>  alert("Error fetching Cities"));

    axios
      .get(`${baseURL}/api/area`)
      .then((response) => {
        setAreas(response.data.response);
        setFilteredAreas(response.data.response);
      })
       
      .catch((error) =>  alert("Got Error , Please Try Again !"));

    if (window.location.href.includes("success")) {
      dispatch(clearCart());
    }
  }, [dispatch]);

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCityId = e.target.value;
    setCity(selectedCityId);

    const newFilteredAreas = areas.filter(
      (area) => area.city === selectedCityId
    );
    setFilteredAreas(newFilteredAreas);
    setArea("");
    setFilteredShops([]);
    setShopId("");
  };

  const handleAreaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedAreaId = e.target.value;
    setArea(selectedAreaId);

    const newFilteredShops = shops.filter((shop) => shop.area === selectedAreaId);
    setFilteredShops(newFilteredShops);
    setShopId("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const orderItems = cart.map((item) => ({
      product_id: item.product._id,
      quantity: item.quantity,
    }));

    const orderData = {
      name: userDetails?.name || "Unknown",
      email: userDetails?.email || "Unknown",
      city,
      area,
      shop: shopId,
      items: orderItems,
      paymentMethod,
      price: totalPrice,
      status: "pending",
    };

    if (!city || !area || !shopId) {
      alert("Please enter proper information before placing the order.");
      return;
    }

    for (let item of orderItems) {
      if (item.quantity > 5) {
        alert("You cannot order a product more then 5 ");
        return;
      }
    }

    try {
      const res = await axios.post(`${baseURL}/api/order`, orderData);

      if (res.status === 200) {
        alert("Order placed successfully!");
        router.push("/salesman");
        dispatch(clearCart());
      } else {
        alert("Error Placing Order")

    
      }
    } catch (error) {
    
      alert("There was an issue placing the order. Please try again.");
    }
  };

  const totalPrice =
    cart.reduce(
      (total: number, item: CartItem) =>
        total + item.product.price * item.quantity,
      0
    ) + 99;

  if (!isClient) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-8 items-start justify-center w-full">
      <h2 className="text-3xl font-bold mt-5 ml-5 w-full underline">Cart</h2>

      <ScrollArea className="h-full max-h-[700px] w-full max-w-[450px] rounded-md border p-7 bg-black text-white overflow-y-auto mt-5">
        {cart.length > 0 ? (
          cart.map((item, index) => (
            <Card key={index} className="mb-4">
              <CardHeader className="flex items-center justify-between">
                <CardTitle>{item.product.name}</CardTitle>
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => dispatch(removeFromCart(item.product))}
                >
                  ×
                </Button>
              </CardHeader>
              <CardContent className="flex items-center gap-4">
                <div className="w-32 h-32">
                  <Image
                    src={"/images.jpeg"}
                    alt={item.product.name}
                    width={128}
                    height={128}
                    className="rounded"
                  />
                </div>
                <div>
                  <p className="font-medium">Price: ${item.product.price}</p>
                  <p>Quantity: {item.quantity}</p>
                  <div className="flex gap-2 mt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        dispatch(
                          decrementQuantity({
                            product: item.product,
                          })
                        )
                      }
                    >
                      -
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        dispatch(
                          incrementQuantity({
                            product: item.product,
                          })
                        )
                      }
                    >
                      +
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center">
            <h2 className="text-2xl font-bold">Your Cart is Empty</h2>
            <p>Start adding items to your cart now!</p>
            <Link
              href="/salesman/products"
              className="text-blue-500 hover:underline"
            >
              Continue Shopping
            </Link>
          </div>
        )}
      </ScrollArea>

      {cart.length > 0 && (
        <Card className="w-full max-w-2xl bg-black text-white mt-5">
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex gap-4">
                <div className="w-1/3">
                  <select
                    name="city"
                    value={city}
                    onChange={handleCityChange}
                    className="bg-white text-black rounded p-2"
                  >
                    <option value="">Select City</option>
                    {cities.map((city) => (
                      <option key={city._id} value={city._id}>
                        {city.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="w-1/3">
                  <select
                    name="area"
                    value={area}
                    onChange={handleAreaChange}
                    className="bg-white text-black rounded p-2"
                  >
                    <option value="">Select Area</option>
                    {filteredAreas.map((area) => (
                      <option key={area._id} value={area._id}>
                        {area.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="w-1/3">
                  <select
                    name="shopId"
                    value={shopId}
                    onChange={(e) => setShopId(e.target.value)}
                    className="bg-white text-black rounded p-2"
                  >
                    <option value="">Select Shop</option>
                    {filteredShops.map((shop) => (
                      <option key={shop._id} value={shop._id}>
                        {shop.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex flex-col">
                <label>Payment Method</label>
                <select
                  name="paymentMethod"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="bg-white text-black rounded p-2 w-40 mt-2"
                >
                  <option value="cod">Cash on Delivery</option>
                  <option value="card" disabled>
                    Card Payment (Disabled)
                  </option>
                </select>
              </div>

              <div className="mt-4">
                <Button type="submit" className="w-full bg-white text-black">
                  Place Order
                </Button>
              </div>
            </form>
            <div className="mt-4">
              <p className="font-medium text-lg">Total Price: ${totalPrice}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CartPage;
