"use client";

import { baseURL } from "@/utils/baseURL";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { isLogin } from "@/utils/Auth";

interface Area {
  _id: string;
  name: string;
  city: string;
}

interface Shop {
  _id: string;
  name: string;
  contact: string;
  area: string;
  ownername: string;
}

interface Product {
  _id: string;
  name: string;
  price: number;
  images?: string[];
  category: string;
}

interface OrderItem {
  _id: string;
  name: string;
  price: number;
  quantity: number;
}

interface UserInfo {
  name: string;
  email: string;
}

const Page: React.FC = () => {
  const [fetchedArea, setFetchedArea] = useState<Area | null>(null);
  const [shops, setShops] = useState<Shop[]>([]);
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [order, setOrder] = useState<OrderItem[]>([]);
  const [total, setTotal] = useState(0);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [categories, setCategories] = useState<
    { _id: string; name: string; subcategories?: string[] }[]
  >([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentProductIndex, setCurrentProductIndex] = useState(0);
  const [searchShopTerm, setSearchShopTerm] = useState("");
  const [error, setError] = useState<String>("");

  const params = useParams();
  const area = params.shops;
  const router = useRouter();

  useEffect(() => {
    const checkRole = async () => {
      const user = await isLogin();
      if (user?.role !== "salesman") {
        router.push("/login");
      }
    };

    checkRole();
  }, []);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUserInfo(JSON.parse(storedUser));
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [areaRes, shopRes, productRes, categoryRes] = await Promise.all([
          axios.get(`${baseURL}/api/area/${area}`),
          axios.get(`${baseURL}/api/shop`),
          axios.get(`${baseURL}/api/product`),
          axios.get(`${baseURL}/api/category`),
        ]);
        const areaData = areaRes.data.response as Area;
        const filteredShops = (shopRes.data.response as Shop[]).filter(
          (shop) => shop.area === area
        );
        setFetchedArea(areaData);
        setShops(filteredShops);
        setProducts(productRes.data.response as Product[]);
        setCategories(categoryRes.data.response as any);
      } catch (error) {
        alert("Error fetching Data");
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const totalAmount = order.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    setTotal(totalAmount);
  }, [order]);

  const handleAddToOrder = (product: Product) => {
    setOrder((prev) => {
      const existingItem = prev.find((item) => item._id === product._id);
      if (existingItem) {
        if (existingItem.quantity >= 5) {
          setError("Maximum quantity of 5 reached.");
          return prev;
        }
        setError("");
        return prev.map((item) =>
          item._id === product._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const handlePlaceOrder = async () => {
    if (!selectedShop) {
      alert("Please select a shop.");
      return;
    }
    const orderItems = order.map((item) => ({
      product_id: item._id,
      quantity: item.quantity,
    }));

    if (orderItems.length == 0) {
      setError("Please Select products! , Order cannot be empty.");
      return;
    }
    const confirmOrder = confirm("Are you sure you want to place this order?");
    if (!confirmOrder) return;

    try {
      await axios.post(`${baseURL}/api/order`, {
        shop: selectedShop._id,
        items: orderItems,
        paymentMethod: "cod",
        price: total,
        name: userInfo?.name,
        email: userInfo?.email,
        area: fetchedArea?._id,
        city: fetchedArea?.city,
        status: "pending",
      });
      setOrder([]);
      setError("");
      router.push("/salesman");
    } catch (error) {
      setError("Failed to place order, Plesase try again!!!");
    }
  };

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    const category = categories.find((cat) => cat._id === categoryId);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value.toLowerCase());
  };

  const handlePreviousProduct = () => {
    setCurrentProductIndex((prev) => Math.max(prev - 3, 0));
  };

  const handleNextProduct = () => {
    setCurrentProductIndex((prev) => Math.min(prev + 3, products.length - 3));
  };
  const handleQuantityChange = (product: Product, quantity: number) => {


    setOrder((prev) => {
      if (quantity === 0) {
        return prev.filter((item) => item._id !== product._id);
      }
      return prev.map((item) =>
        item._id === product._id ? { ...item, quantity } : item
      );
    });
    setError("");
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm);
    const matchesCategory =
      selectedCategory === "all" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const filterShops = shops.filter((shop) =>
    shop.name.toLowerCase().includes(searchShopTerm)
  );

  return (
    <div className="min-h-screen bg-white p-4 fle">
      <div className="flex justify-between mx-10 ">
        <h1 className=" text-2xl font-bold text-black">Shops</h1>
        <Input
          placeholder="Search for a Shop"
          className="bg-gray-200 w-70 text-black "
          value={searchShopTerm}
          onChange={(e) => setSearchShopTerm(e.target.value)}
        />
      </div>
      <div className="w-full h-auto  gap-4 mt-10 flex flex-wrap mx-10">
        {filterShops.length > 0 ? (
          filterShops.map((shop) => (
            <Card
              key={shop._id}
              className="p-4 text-center w-[250px] bg-gray-200 rounded shadow"
            >
              <h2 className="text-lg font-semibold">
                {shop.name.toUpperCase()}
              </h2>
              <p>Owner: {shop.ownername?.toUpperCase()}</p>

              <p>Contact: {shop.contact}</p>
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    className="bg-black text-white "
                    onClick={() => {
                      setSelectedShop(shop);
                      setError("");
                      setOrder([]);
                      setCurrentProductIndex((prev) => Math.max(prev - 3, 0));
                    }}
                  >
                    Place Order
                  </Button>
                </DialogTrigger>
                {selectedShop && selectedShop._id === shop._id && (
                  <DialogContent className="bg-black p-4 rounded-md">
                    <DialogHeader>
                      <DialogTitle>
                        Manage Products for {selectedShop.name}
                        {error && (
                          <p className="text-red-500 my-4 text-center">
                            {error}
                          </p>
                        )}
                      </DialogTitle>
                    </DialogHeader>
                    <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
                      <Select
                        onValueChange={handleCategoryChange}
                        defaultValue="all"
                      >
                        <SelectTrigger className={"bg-black text-white"}>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent className={"bg-black text-white"}>
                          <SelectItem value="all">All Products</SelectItem>
                          {categories.map((category) => (
                            <SelectItem key={category._id} value={category._id}>
                              {category.name.toUpperCase()}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        placeholder="Search for a product"
                        className="bg-gray-100 w-50 text-black focus:border focus:border-white"
                        value={searchTerm}
                        onChange={handleSearchChange}
                      />
                    </div>
                    <div>
                      {filteredProducts.length > 0 ? (
                        <>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {filteredProducts
                              .slice(
                                currentProductIndex,
                                currentProductIndex + 3
                              )
                              .map((product) => (
                                <Card
                                  key={product._id}
                                  className="p-2 bg-gray-50 shadow h-[220px]"
                                >
                                  <div className="flex">
                                    <div>
                                      <h2 className="text-sm font-medium text-center mt-0">
                                        {product.name.toUpperCase()}
                                      </h2>
                                      <p className="text-xs text-black font-bold text-center">
                                        Price: {product.price}
                                      </p>
                                    </div>
                                    <img
                                      src={
                                        product.images?.[0] || "/images.jpeg"
                                      }
                                      alt={product.name}
                                      className={`w-15 h-24 object-cover rounded ${
                                        product.images?.[0] ? "ml-2" : "ml-1"
                                      }  `}
                                    />
                                  </div>

                                  <div className="w-full " key={product._id}>
                                    <div className="flex justify-center gap-2 w-full ">
                                      <button
                                        className={`p-1 bg-gray-300 rounded text-sm `}
                                        // disabled={ checkQuantity === 0 && quantityProductId !== product._id}
                                        onClick={() =>
                                          handleQuantityChange(
                                            product,
                                            Math.max(
                                              (order.find(
                                                (item) =>
                                                  item._id === product._id
                                              )?.quantity || 0) - 1,
                                              0
                                            )
                                          )
                                        }
                                      >
                                        -
                                      </button>
                                      <span>
                                        {order.find(
                                          (item) => item._id === product._id
                                        )?.quantity || 0}
                                      </span>
                                      <button
                                        className="p-1 bg-gray-300 rounded text-sm"
                                        onClick={() =>
                                          handleAddToOrder(product)
                                        }
                                      >
                                        +
                                      </button>
                                    </div>
                                    <Button
                                      variant="outline"
                                      className=" mt-2 w-24 bg-black text-white ml-4"
                                      onClick={() => handleAddToOrder(product)}
                                    >
                                      Add
                                    </Button>
                                  </div>
                                </Card>
                              ))}
                          </div>
                          <div className="flex justify-between mt-4">
                            <Button
                              className="bg-white"
                              onClick={handlePreviousProduct}
                              disabled={currentProductIndex === 0}
                            >
                              Previous
                            </Button>
                            <Button
                              className="bg-white"
                              onClick={handleNextProduct}
                              disabled={
                                currentProductIndex + 3 >= products.length
                              }
                            >
                              Next
                            </Button>
                          </div>
                          <div className="mt-4 overflow-y-scroll  h-20 w-30">
                            {order.map((item, index) => {
                              return item ? (
                                <p key={index} className="text-white text-sm">
                                  {item.name.toUpperCase()} - {item.quantity} x
                                </p>
                              ) : (
                                <p className="text-white " key={index}>
                                  Product not found
                                </p>
                              );
                            })}
                          </div>
                          <p className="text-left mt-2 text-lg text-white  font-medium">
                            Total: {total}
                          </p>
                          <Button
                            className="w-full mt-2 bg-white"
                            onClick={handlePlaceOrder}
                          >
                            Place Order
                          </Button>
                        </>
                      ) : (
                        <p className="text-center text-sm text-gray-500">
                          No products available.
                        </p>
                      )}
                    </div>
                  </DialogContent>
                )}
              </Dialog>
            </Card>
          ))
        ) : (
          <p>No Shops Found.</p>
        )}
      </div>
    </div>
  );
};

export default Page;
