
"use client";
import React, { useEffect, useMemo, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { baseURL } from "@/utils/baseURL";
import axios from "axios";
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
import { Card } from "@/components/ui/card";

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

type City = {
  _id: string;
  name: string;
};

type User = {
  _id: string;
  username: string;
};

type Shop = {
  _id: string;
  name: string;
  area: string;
};

type Area = {
  _id: string;
  name: string;
  city: string; 
};

type Product = {
  _id: string;
  name: string;
  price: number;
  createdAt: string;
  category: string;
  subcategory?: string;
  images: string[];
};

interface OrderItem {
  _id: string;
  name: string;
  price: number;
  quantity: number;
  images: string[];
}

const OrdersPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [users, setUsers] = useState<User[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [shops, setShops] = useState<Shop[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [filterUser, setFilterUser] = useState<string>("");
  const [filterCity, setFilterCity] = useState<string>("");
  const [filterArea, setFilterArea] = useState<string>("");
  const [filterShop, setFilterShop] = useState<string>("");
  const [availableAreas, setAvailableAreas] = useState<Area[]>([]);
  const [availableShops, setAvailableShops] = useState<Shop[]>([]);
  const [viewDialog, setViewDialog] = useState<boolean>(false);
  const [editDialog, setEditDialog] = useState<boolean>(false);
  const [deleteDialog, setDeleteDialog] = useState<boolean>(false);
  const [orderId, setOrderId] = useState<string>("");
  const [actionOrder, setActionOrder] = useState<Order[]>([]);
  const [order, setOrder] = useState<OrderItem[]>([]);
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
      if (user?.role !== "admin") {
        router.push("/login");
      } else {
        setLoading(false);
      }
    };
    checkRole();
  }, [router]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await axios.get(`${baseURL}/api/order`);
        setOrders(res.data || []);
        setFilteredOrders(res.data || []);
      } catch (error) {
        alert("Error fetching orders");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          usersRes,
          citiesRes,
          areaRes,
          shopsRes,
          productRes,
          categoriesRes,
        ] = await Promise.all([
          axios.get(`${baseURL}/api/user`),
          axios.get(`${baseURL}/api/city`),
          axios.get(`${baseURL}/api/area`),
          axios.get(`${baseURL}/api/shop`),
          axios.get(`${baseURL}/api/product`),
          axios.get(`${baseURL}/api/category`),
        ]);
        setUsers(usersRes.data.response || []);
        setCities(citiesRes.data.response || []);
        setAreas(areaRes.data.response || []);
        setShops(shopsRes.data.response || []);
        setProducts(productRes.data.response || []);
        setCategories(categoriesRes.data.response || []);
      } catch (error) {
        alert("Error fetching filter data");
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (filterCity) {
      const filteredAreas = areas.filter((area) => area.city === filterCity);
      setAvailableAreas(filteredAreas);
    } else {
      setAvailableAreas([]);
    }
    setFilterArea("");
    setFilterShop(""); 
  }, [filterCity, areas]);

  useEffect(() => {
    if (filterArea) {
      const filteredShops = shops.filter((shop) => shop.area === filterArea);
      setAvailableShops(filteredShops);
    } else {
      setAvailableShops([]);
    }
    setFilterShop("");
  }, [filterArea, shops]);

  useEffect(() => {
    let updatedOrders = [...orders];
    if (filterUser) {
      updatedOrders = updatedOrders.filter(
        (order) => order.name === filterUser
      );
    }
    if (filterCity) {
      updatedOrders = updatedOrders.filter(
        (order) => order.city === filterCity
      );
    }
    if (filterArea) {
      updatedOrders = updatedOrders.filter(
        (order) => order.area === filterArea
      );
    }
    if (filterShop) {
      updatedOrders = updatedOrders.filter(
        (order) => order.shop === filterShop
      );
    }
    setFilteredOrders(updatedOrders);
  }, [filterUser, filterCity, filterArea, filterShop, orders]);

  useEffect(() => {
    const ActionOrder = orders.find((order) => order._id === orderId);
    if (ActionOrder) {
      setActionOrder([ActionOrder]);
      const orderItems = ActionOrder.items.map((item) => {
        const product = products.find((p) => p._id === item.product_id);
        return {
          _id: item.product_id,
          name: product?.name || "Unknown",
          price: product?.price || 0,
          quantity: item.quantity,
          images: product?.images || [],
        };
      });
      setOrder(orderItems);
    } else {
      setOrder([]);
      setActionOrder([]);
    }
  }, [orderId, orders, products]);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const orderToUpdate = orders.find((order) => order._id === orderId);
      if (!orderToUpdate) {
        alert("Order not found");
        return;
      }
      await axios.put(`${baseURL}/api/order/${orderId}`, {
        ...orderToUpdate,
        status: newStatus,
      });
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === orderId ? { ...order, status: newStatus } : order
        )
      );
    } catch (error) {
      alert("Error updating order status");
    }
  };

  const handleViewDialog = (state: boolean, id: string) => {
    setViewDialog(state);
    setOrderId(id);
    setError("");
  };

  const handleEditDialog = (state: boolean, id: string) => {
    setEditDialog(state);
    if (state) {
      setOrderId(id);
      setError("");
    } else {
      setOrder([]);
      setActionOrder([]);
      setOrderId("");
      setError("");
    }
  };

  const handleDeleteDialog = (state: boolean, id: string) => {
    setDeleteDialog(state);
    setOrderId(id);
    setError("");
  };

  const getProductDetails = (id: string) => {
    return products.filter((p) => p._id === id);
  };

  const handleAddToOrder = (product: Product) => {
    setOrder((prev: OrderItem[]) => {
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
    setOrder((prev: OrderItem[]) => {
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
    const orderItems = order.map((item) => ({
      product_id: item._id,
      quantity: item.quantity,
    }));

    if (orderItems.length === 0) {
      setError("Please select products! Order cannot be empty.");
      return;
    }

    const totalPrice = order.reduce(
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
        items: orderItems,
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
                items: orderItems,
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

      setOrder([]);
      setActionOrder([]);
      setOrderId("");
      setError("");
      setEditDialog(false);
    } catch (error: any) {
      console.error("Error updating order:", error.response?.data || error.message);
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
      <h1 className="text-2xl font-bold mb-6">Orders</h1>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <Select
          onValueChange={(value) => setFilterUser(value === "all" ? "" : value)}
        >
          <SelectTrigger className="w-48 bg-black text-white">
            <SelectValue placeholder="Filter by User" />
          </SelectTrigger>
          <SelectContent className="bg-black text-white">
            <SelectItem className="bg-black text-white" value="all">
              All Users
            </SelectItem>
            {users.map((user) => (
              <SelectItem
                className="bg-black text-white"
                key={user._id}
                value={user.username}
              >
                {user.username.toUpperCase()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          onValueChange={(value) => setFilterCity(value === "all" ? "" : value)}
        >
          <SelectTrigger className="w-48 bg-black text-white">
            <SelectValue placeholder="Filter by City" />
          </SelectTrigger>
          <SelectContent className="bg-black text-white">
            <SelectItem className="bg-black text-white" value="all">
              All Cities
            </SelectItem>
            {cities.map((city) => (
              <SelectItem
                className="bg-black text-white"
                key={city._id}
                value={city._id}
              >
                {city.name.toUpperCase()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          onValueChange={(value) => setFilterArea(value === "all" ? "" : value)}
          disabled={!filterCity}
        >
          <SelectTrigger className="w-48 bg-black text-white">
            <SelectValue placeholder="Filter by Area" />
          </SelectTrigger>
          <SelectContent className="bg-black text-white">
            <SelectItem className="bg-black text-white" value="all">
              All Areas
            </SelectItem>
            {availableAreas.length > 0 ? (
              availableAreas.map((area) => (
                <SelectItem
                  className="bg-black text-white"
                  key={area._id}
                  value={area.name}
                >
                  {area.name.toUpperCase()}
                </SelectItem>
              ))
            ) : (
              <p className="bg-black text-white text-center"  >
                No areas available
              </p>
            )}
          </SelectContent>
        </Select>

        <Select
          onValueChange={(value) => setFilterShop(value === "all" ? "" : value)}
          disabled={!filterArea}
        >
          <SelectTrigger className="w-48 bg-black text-white">
            <SelectValue placeholder="Filter by Shop" />
          </SelectTrigger>
          <SelectContent className="bg-black text-white">
            <SelectItem className="bg-black text-white" value="all">
              All Shops
            </SelectItem>
            {availableShops.length > 0 ? (
              availableShops.map((shop) => (
                <SelectItem
                  className="bg-black text-white"
                  key={shop._id}
                  value={shop._id}
                >
                  {shop.name.toUpperCase()}
                </SelectItem>
              ))
            ) : (
              <p className="bg-black text-white text-center"  >
                No shops available
              </p>
            )}
          </SelectContent>
        </Select>
      </div>

      {/* Orders Table */}
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="overflow-x-auto bg-white shadow-md rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableCell>Salesman's Name</TableCell>
                <TableCell>Salesman's Email</TableCell>
                <TableCell>Shop</TableCell>
                <TableCell>Total</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <TableRow key={order._id}>
                    <TableCell>{order.name}</TableCell>
                    <TableCell>{order.email}</TableCell>
                    <TableCell>
                      {shops.find((shop) => shop._id === order.shop)?.name ||
                        "Unknown"}
                    </TableCell>
                    <TableCell>${order.price.toFixed(2)}</TableCell>
                    <TableCell>
                      <Select
                        onValueChange={(value) =>
                          handleStatusChange(order._id, value)
                        }
                        defaultValue={order.status}
                      >
                        <SelectTrigger className="bg-black text-white">
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent className="bg-black text-white">
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="processing">Processing</SelectItem>
                          <SelectItem value="delivered">Delivered</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
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
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    No orders found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* View Dialog */}
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

      {/* Edit Dialog */}
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
                                      (order.find(
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
                                {order.find((item) => item._id === product._id)
                                  ?.quantity || 0}
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
                    {order.length > 0 ? (
                      order.map((item: OrderItem, index: number) => (
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
                    {order
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

      {/* Delete Dialog */}
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
                  } catch (error) {
                    setError("Error deleting order.");
                  }
                }}
              >
                Delete
              </Button>
              <Button
                className="bg-white text-black"
                onClick={() => setDeleteDialog(false)}
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

export default OrdersPage;
