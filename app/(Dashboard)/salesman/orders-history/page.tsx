"use client";

import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { baseURL } from "@/utils/baseURL";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useRouter } from "next/navigation";
import { isLogin } from "@/utils/Auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Delete, Eye, Pencil } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";

type Product = {
  _id: string;
  name: string;
  price: number;
  createdAt: string;
  category: string;
  subcategory?: string;
  images: string[];
};

type Shop = {
  _id: string;
  name: string;
};

type OrderItem = {
  _id: string;
  name: string;
  price: number;
  quantity: number;
  images: string[];
};

type Order = {
  _id: string;
  name: string;
  email: string;
  city: string;
  area: string;
  shop: string;
  items: { product_id: string; quantity: number }[];
  paymentMethod: string;
  price: number;
  createdAt: string;
  status: string;
};

const OrdersHistory = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [userDetails, setUserDetails] = useState<{
    name: string;
    email: string;
  } | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewDialog, setViewDialog] = useState<boolean>(false);
  const [editDialog, setEditDialog] = useState<boolean>(false);
  const [deleteDialog, setDeleteDialog] = useState<boolean>(false);
  const [orderId, setOrderId] = useState<string>("");
  const [actionOrder, setActionOrder] = useState<Order[]>([]);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [categories, setCategories] = useState<
    { _id: string; name: string; subcategories?: string[] }[]
  >([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentProductIndex, setCurrentProductIndex] = useState(0);
  const [error, setError] = useState<string>("");
  const router = useRouter();

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
  }, [router]);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUserDetails(JSON.parse(userData));
    }
    axios
      .get(`${baseURL}/api/product`)
      .then((response) => {
        setProducts(response.data.response || []);
      })
      .catch((error) => {
        setError("Error fetching products");
      });
    axios
      .get(`${baseURL}/api/shop`)
      .then((response) => {
        setShops(response.data.response || []);
      })
      .catch((error) => {
        setError("Error fetching shops");
      });
    axios
      .get(`${baseURL}/api/category`)
      .then((response) => {
        setCategories(response.data.response || []);
      })
      .catch((error) => {
        setError("Error fetching categories");
      });
  }, []);

  useEffect(() => {
    if (userDetails?.email) {
      axios
        .get(`${baseURL}/api/order`)
        .then((response) => {
          const fetchedOrders = response.data as Order[];
          const userOrders = fetchedOrders
            .filter((order) => order.email === userDetails.email)
            .sort(
              (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime()
            );
          setOrders(userOrders);
        })
        .catch((error) => {
          setError("Error fetching orders");
        });
    }
  }, [userDetails?.email]);

  useEffect(() => {
    const selectedOrder = orders.find((order) => order._id === orderId);
    if (selectedOrder) {
      setActionOrder([selectedOrder]);
      const items = selectedOrder.items.map((item) => {
        const product = products.find((p) => p._id === item.product_id);
        return {
          _id: item.product_id,
          name: product?.name || "Unknown",
          price: product?.price || 0,
          quantity: item.quantity,
          images: product?.images || [],
        };
      });
      setOrderItems(items);
    } else {
      setActionOrder([]);
      setOrderItems([]);
    }
  }, [orderId, orders, products]);

  const getProductDetails = (product_id: string) => {
    return products.filter((product) => product._id === product_id);
  };

  const getShopDetails = (shop_id: string) => {
    return shops.find((shop) => shop._id === shop_id);
  };

  const handleViewDialog = (state: boolean, id: string) => {
    setViewDialog(state);
    setOrderId(state ? id : "");
    setError("");
  };

  const handleEditDialog = (state: boolean, id: string) => {
    setEditDialog(state);
    if (state) {
      setOrderId(id);
      const selectedOrder = orders.find((order) => order._id === id);
      if (selectedOrder) {
        const items = selectedOrder.items.map((item) => {
          const product = products.find((p) => p._id === item.product_id);
          return {
            _id: item.product_id,
            name: product?.name || "Unknown",
            price: product?.price || 0,
            quantity: item.quantity,
            images: product?.images || [],
          };
        });
        setOrderItems(items);
      }
    } else {
      setOrderItems([]);
      setActionOrder([]);
      setOrderId("");
      setError("");
    }
  };

  const handleDeleteDialog = (state: boolean, id: string) => {
    setDeleteDialog(state);
    setOrderId(state ? id : "");
    setError("");
  };

  const handleAddToOrder = (product: Product) => {
    setOrderItems((prev: OrderItem[]) => {
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
      return [
        ...prev,
        { ...product, quantity: 1, images: product.images || [] },
      ];
    });
  };

  const handleQuantityChange = (product: Product, quantity: number) => {
    setOrderItems((prev: OrderItem[]) => {
      if (quantity === 0) {
        setError("");
        return prev.filter((item) => item._id !== product._id);
      }
      const existingItem = prev.find((item) => item._id === product._id);
      if (existingItem && quantity > 5) {
        setError("Maximum quantity of 5 reached.");
        return prev;
      }
      setError("");
      return prev.map((item) =>
        item._id === product._id ? { ...item, quantity } : item
      );
    });
  };

  const handleEditOrder = async () => {
    const orderItemsData = orderItems.map((item) => ({
      product_id: item._id,
      quantity: item.quantity,
    }));

    if (orderItemsData.length === 0) {
      setError("Please select products! Order cannot be empty.");
      return;
    }

    const totalPrice = orderItems.reduce(
      (sum: number, item: OrderItem) => sum + item.price * item.quantity,
      0
    );

    const confirmOrder = confirm("Are you sure you want to update this order?");
    if (!confirmOrder) return;

    if (!actionOrder[0]) {
      setError("Order data not found.");
      return;
    }

    try {
      await axios.put(`${baseURL}/api/order/${orderId}`, {
        shop: actionOrder[0].shop,
        items: orderItemsData,
        paymentMethod: actionOrder[0].paymentMethod || "cod",
        price: totalPrice,
        name: actionOrder[0].name,
        email: actionOrder[0].email,
        area: actionOrder[0].area,
        city: actionOrder[0].city,
        status: actionOrder[0].status,
      });

      setOrders((prevOrders) =>
        prevOrders.map((o) =>
          o._id === orderId
            ? {
                ...o,
                shop: actionOrder[0].shop,
                items: orderItemsData,
                paymentMethod: actionOrder[0].paymentMethod || "cod",
                price: totalPrice,
                name: actionOrder[0].name,
                email: actionOrder[0].email,
                area: actionOrder[0].area,
                city: actionOrder[0].city,
                status: actionOrder[0].status,
              }
            : o
        )
      );

      setOrderItems([]);
      setActionOrder([]);
      setOrderId("");
      setError("");
      setEditDialog(false);
    } catch (error: any) {
      console.error(
        "Error updating order:",
        error.response?.data || error.message
      );
      setError("Failed to update order, please try again!");
    }
  };

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setCurrentProductIndex(0);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value.toLowerCase());
  };

  const handlePreviousProduct = () => {
    setCurrentProductIndex((prev) => Math.max(prev - 3, 0));
  };

  const handleNextProduct = () => {
    setCurrentProductIndex((prev) =>
      Math.min(prev + 3, filteredProducts.length - 3)
    );
  };

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm);
      const matchesCategory =
        selectedCategory === "all" || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, selectedCategory]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Order History</h1>

      {loading ? (
        <p className="text-lg">Loading...</p>
      ) : orders.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Shop Name</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => {
              const shop = getShopDetails(order.shop);
              return (
                <TableRow key={order._id}>
                  <TableCell>
                    {shop ? shop.name.toUpperCase() : "Shop not found"}
                  </TableCell>
                  <TableCell>
                    {new Date(order.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{order.status}</TableCell>
                  <TableCell>${order.price.toFixed(2)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger className="bg-black text-white p-2 rounded-sm">
                        Actions
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="bg-black text-white">
                        <DropdownMenuItem
                          onClick={() => handleViewDialog(true, order._id)}
                        >
                          <Eye className="mr-2" />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleEditDialog(true, order._id)}
                        >
                          <Pencil className="mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteDialog(true, order._id)}
                        >
                          <Delete className="mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      ) : (
        <p className="text-lg">No orders found for your account.</p>
      )}

      <Dialog open={viewDialog} onOpenChange={setViewDialog}>
        <DialogContent className="bg-black text-white">
          <DialogHeader>
            <DialogTitle>View Order</DialogTitle>
            {error && (
              <p className="text-red-500 mb-4 mt-4 text-center">{error}</p>
            )}
          </DialogHeader>
          <div className="h-auto w-full">
            {actionOrder.map((order) => (
              <div key={order._id}>
                <h2 className="text-2xl font-semibold">Products</h2>
                {order.items?.map((item) => {
                  const product = getProductDetails(item.product_id);
                  return product.map((p) => (
                    <p key={p._id}>
                      {p.name.toUpperCase()} - {item.quantity}x
                    </p>
                  ));
                })}
                <h2 className="text-2xl mt-4 border-t-2">
                  Total - ${order.price.toFixed(2)}
                </h2>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={editDialog} onOpenChange={setEditDialog}>
        <DialogContent className="bg-black text-white">
          <DialogHeader>
            <DialogTitle>Edit Order</DialogTitle>
            {error && (
              <p className="text-red-500 mb-4 mt-4 text-center">{error}</p>
            )}
          </DialogHeader>
          <div className="w-full h-auto">
            <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
              <Select onValueChange={handleCategoryChange} defaultValue="all">
                <SelectTrigger className="bg-black text-white">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent className="bg-black text-white">
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
                      .slice(currentProductIndex, currentProductIndex + 3)
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
                                Price: ${product.price.toFixed(2)}
                              </p>
                            </div>
                            <img
                              src={product.images?.[0] || "/images.jpeg"}
                              alt={product.name}
                              className={`w-15 h-24 object-cover rounded ${
                                product.images?.[0] ? "ml-2" : "ml-1"
                              }`}
                            />
                          </div>
                          <div className="w-full">
                            <div className="flex justify-center gap-2 w-full">
                              <button
                                className="px-1 bg-gray-300 text-black rounded text-lg"
                                onClick={() =>
                                  handleQuantityChange(
                                    product,
                                    Math.max(
                                      (orderItems.find(
                                        (item) => item._id === product._id
                                      )?.quantity || 0) - 1,
                                      0
                                    )
                                  )
                                }
                              >
                                -
                              </button>
                              <span className="text-black">
                                {orderItems.find(
                                  (item) => item._id === product._id
                                )?.quantity || 0}
                              </span>
                              <button
                                className="px-1 bg-gray-300 text-black rounded text-sm"
                                onClick={() => handleAddToOrder(product)}
                              >
                                +
                              </button>
                            </div>
                            <Button
                              variant="outline"
                              className="mt-2 w-24 bg-black text-white ml-4"
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
                      className="bg-white text-black"
                      onClick={handlePreviousProduct}
                      disabled={currentProductIndex === 0}
                    >
                      Previous
                    </Button>
                    <Button
                      className="bg-white text-black"
                      onClick={handleNextProduct}
                      disabled={
                        currentProductIndex + 3 >= filteredProducts.length
                      }
                    >
                      Next
                    </Button>
                  </div>
                  <div className="mt-4 overflow-y-scroll h-20 w-full">
                    {orderItems.length > 0 ? (
                      orderItems.map((item: OrderItem, index: number) => (
                        <p key={index} className="text-white text-sm">
                          {item.name.toUpperCase()} - {item.quantity}x
                        </p>
                      ))
                    ) : (
                      <p className="text-white text-sm">No products selected</p>
                    )}
                  </div>
                  <p className="text-left mt-2 text-lg text-white font-medium">
                    Total: $
                    {orderItems
                      .reduce(
                        (sum: number, item: OrderItem) =>
                          sum + item.price * item.quantity,
                        0
                      )
                      .toFixed(2)}
                  </p>
                  <Button
                    className="w-full mt-2 bg-white text-black"
                    onClick={handleEditOrder}
                  >
                    Update Order
                  </Button>
                </>
              ) : (
                <p className="text-center text-sm text-gray-500">
                  No products available.
                </p>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialog} onOpenChange={setDeleteDialog}>
        <DialogContent className="bg-black text-white">
          <DialogHeader>
            <DialogTitle>Delete Order</DialogTitle>
            {error && (
              <p className="text-red-500 mb-4 mt-4 text-center">{error}</p>
            )}
          </DialogHeader>
          <div className="h-20">
            <h2 className="text-center">
              Are you sure you want to delete this order?
            </h2>
            <div className="flex justify-center items-center gap-8 mt-5">
              <Button
                className="bg-red-700 text-white"
                onClick={async () => {
                  try {
                    await axios.delete(`${baseURL}/api/order/${orderId}`);
                    setOrders((prev) =>
                      prev.filter((order) => order._id !== orderId)
                    );
                    setDeleteDialog(false);
                    setOrderId("");
                    setError("");
                  } catch (error) {
                    setError("Error deleting order.");
                  }
                }}
              >
                Delete
              </Button>
              <Button
                className="bg-white text-black"
                onClick={() => {
                  setDeleteDialog(false);
                  setOrderId("");
                  setError("");
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrdersHistory;