"use client";

import React, { ReactEventHandler, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import axios from "axios";
import { baseURL } from "@/utils/baseURL";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDispatch } from "react-redux";
import { addToCart } from "@/redux/cartSlice";
import { useRouter } from "next/navigation";
import { isLogin } from "@/utils/Auth";

const ProductPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedSubcategory, setSelectedSubcategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [subcategories, setSubCategories] = useState([]);
  const dispatch = useDispatch();


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
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(`${baseURL}/api/product`);
        setProducts(response.data.response);
      } catch (error) {
        alert("Error fetching products")
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get(`${baseURL}/api/category`);
        setCategories(res.data.response);
      } catch (error) {
        alert("Error fetching categories")
      }
    };

    fetchCategories();
  }, []);

  // const handleCategoryChange = (categoryId:string) => {
  //   setSelectedCategory(categoryId);
  //   if (categoryId === "all") {
  //     setSubCategories([]);
  //   } else {
  //     const selectedCategoryObj = categories.find((cat) => cat._id === categoryId);
  //     // setSubCategories(selectedCategoryObj?.subcategories || []);
  //   }
  //   setSelectedSubcategory("all");
  // };

  const handleSubcategoryChange = (subcategory:any) => {
    setSelectedSubcategory(subcategory);
  };

  // const handleSearchChange = (event:ReactEventHandler) => {
  //   setSearchTerm(event.target.value.toLowerCase());
  // };

  // const filteredProducts = products.filter((product) => {
  //   const matchesCategory =
  //     selectedCategory === "all" || product.category === selectedCategory;
  //   const matchesSubcategory =
  //     selectedSubcategory === "all" || product.subcategory  === selectedSubcategory;
  //   const matchesSearch = product.name.toLowerCase().includes(searchTerm);
  //   return matchesCategory && matchesSubcategory && matchesSearch;
  // });

  const handleAddToCart = (product:any) => {
    const cartItem = {
      product: {
        _id: product._id,
        name: product.name,
        price: product.price,
        images: product.images,
      },
      quantity: 1,
    };
    dispatch(addToCart(cartItem));
  };

  return (
    <div className="p-6">
      {/* <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
        <Select onValueChange={handleCategoryChange} defaultValue="all">
          <SelectTrigger className={"bg-black text-white"}>
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent className={"bg-black text-white"}>
            <SelectItem value="all">All Products</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category._id} value={category._id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {subcategories.length > 0 && (
          <Select onValueChange={handleSubcategoryChange} defaultValue="all">
            <SelectTrigger className={"bg-black text-white"}>
              <SelectValue placeholder="Select a subcategory" />
            </SelectTrigger>
            <SelectContent className={"bg-black text-white"}>
              <SelectItem value="all">All Subcategories</SelectItem>
              {subcategories.map((sub, index) => (
                <SelectItem key={index} value={sub}>
                  {sub}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <Input
          placeholder="Search for a product"
          className="bg-gray-100 w-50 text-black"
          value={searchTerm}
          onChange={handleSearchChange}
        />
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : filteredProducts.length > 0 ? (
        <div className="flex flex-wrap gap-9 justify-start">
          {filteredProducts.map((product) => (
            <div
              key={product._id}
              className="flex-shrink-0 w-full sm:w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/6"
            >
              <Card className="shadow-md rounded-lg overflow-hidden w-full">
                <CardHeader>
                  <img
                    src={product.images[0] || "/images.jpeg"}
                    alt={product.name}
                    className="w-full h-40 object-cover"
                  />
                  <CardTitle className="mt-4 text-lg font-semibold">
                    {product.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-md font-bold">${product.price}</p>
                  <p className="text-md "> {product.subcategory}</p>

                  <Button
                    className="bg-black text-white text-sm px-3 py-1"
                    onClick={() => handleAddToCart(product)}
                  >
                    Add to Cart
                  </Button>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      ) : (
        <div>No products found.</div>
      )} */}
    </div>
  );
};

export default ProductPage;
