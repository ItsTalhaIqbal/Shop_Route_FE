"use client";
import React, { ReactEventHandler, useEffect, useState } from "react";
import axios from "axios";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { baseURL } from "@/utils/baseURL";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { isLogin } from "@/utils/Auth";

type Product = {
  _id: string;
  name: string;
  price: number;
  createdAt: string;
  category: string;
  subcategory?: string;
  images: string[];
};

type Category = {
  _id: string;
  name: string;
  subcategories: string[];
};

const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [productName, setProductName] = useState<string>("");
  const [price, setPrice] = useState<String>("");
  const [category, setCategory] = useState<string>("");
  const [subcategory, setSubcategory] = useState<string>("");
  const [productImages, setProductImages] = useState<string[]>([]);
  const [imageLinks, setImageLinks] = useState<string[]>([]);
  const [pendingUploadImages, setPendingUploadImages] = useState<any>([]);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [editProductId, setEditProductId] = useState<string | null>(null);
  const [deleteProductId, setDeleteProductId] = useState<string | null>(null);
  const [originalImages, setOriginalImages] = useState<string[]>([]);
  const [error, setError] = useState<String>("");

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

    const fetchData = async () => {
      try {
        const [prodRes, catRes] = await Promise.all([
          axios.get(`${baseURL}/api/product`),
          axios.get(`${baseURL}/api/category`),
        ]);
        setProducts(prodRes.data.response);
        setCategories(catRes.data.response);
      } catch (error) {
        alert("Error fetching data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (editProductId) {
      const product = products.find((prod) => prod._id === editProductId);
      if (product) {
        setOriginalImages(product.images || []);
        setProductImages(product.images || []);
      }
    }
  }, [editProductId, products]);

  const handleFileChange = (e :any) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files); 
      setPendingUploadImages((prev:any) =>  [...prev, ...selectedFiles] );
    }
  };
  
  const resetForm = () => {
    setProductName("");
    setPrice("");
    setCategory("");
    setSubcategory("");
    setImageLinks([]);
    setProductImages([]);
    setPendingUploadImages([]);
    setOriginalImages([]);
    setEditProductId(null);
    setError("");
  };

  const handleRemoveImage = async (index: number, link: string) => {
    try {
      const imageName = link.split("/").pop();
      await axios.delete(`${baseURL}/api/upload/${imageName}`);

      setImageLinks((prevLinks) => {
        const updatedLinks = prevLinks.filter((_, i) => i !== index);

        return updatedLinks;
      });

      setProductImages((prevImages) => {
        const updatedImages = prevImages.filter((_, i) => i !== index);
        return updatedImages;
      });
    } catch (error) {
      alert("Failed to remove the image. Please try again.");
    }
  };

  const handleAddOrUpdateProduct = async () => {
    if (!productName.trim() || !category || !subcategory) {
      setError("All fields  are required.");
      return;
    }
    if (Number(price) == 0 || Number(price) < 0) {
      setError("Price must be greather than 0");
      return;
    }

    if (price.includes(".")) {
      setError("Price Format isn't correct");
      return;
    }
    if(productName.trim().length < 3){
      setError("Product Name name atleast 3 cheracters long.")
      return
    }

    const duplicateProduct = products.find(
      (prod) =>
        prod.name.toLowerCase() === productName.trim().toLowerCase() &&
        prod.category === category &&
        prod.subcategory === subcategory &&
        prod._id !== editProductId
    );

    if (duplicateProduct) {
      setError(
        "A product with the same name, category, and subcategory already exists."
      );
      return;
    }

    try {
      let uploadedImages = [];
      let finalImages = [...productImages];

      if (pendingUploadImages.length > 0) {
        const formData = new FormData();
        pendingUploadImages.forEach((file:any) => {
          formData.append("images", file);
        });

        const res = await axios.post(`${baseURL}/api/upload`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        if (res.data && res.data.filePaths) {
          uploadedImages = res.data.filePaths;
          finalImages = [...productImages, ...uploadedImages];
        } else {
   
          setError("Image upload failed. Please try again.");
          return;
        }
      }

      const imagesChanged =
        JSON.stringify(originalImages) !== JSON.stringify(finalImages);

      const productData = {
        name: productName.trim().toLowerCase(),
        price,
        category,
        subcategory,
        images: imagesChanged ? finalImages : originalImages,
      };

      if (editProductId) {
        await axios.put(`${baseURL}/api/product/${editProductId}`, productData);
        setProducts((prev: any) =>
          prev
            ? prev.map((prod: any) =>
                prod._id === editProductId ? { ...prod, ...productData } : prod
              )
            : prev
        );
      } else {
        const res = await axios.post(`${baseURL}/api/product`, productData);
        setProducts((prev) => [res.data.response, ...prev]);
      }

      setShowModal(false);
      resetForm();
    } catch (error) {
      setError("An error occurred. Please try again.");
    }
  };

  const handleDeleteProduct = async () => {
    const selectedProduct = products.find(
      (product) => product._id === deleteProductId
    );

    if (selectedProduct && selectedProduct.images) {
      try {
        await Promise.all(
          selectedProduct.images.map(async (image) => {
            const imageName = image.split("/").pop();
            await axios.delete(`${baseURL}/api/upload/${imageName}`);
          })
        );

        await axios.delete(`${baseURL}/api/product/${deleteProductId}`);

        setProducts((prev) =>
          prev.filter((product) => product._id !== deleteProductId)
        );
        setDeleteProductId(null);
      } catch (error) {
    
        alert("An error occurred while deleting the product.");
      }
    } else {
      alert("No images to delete for this product")

    }
  };



  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Products</h1>
      <div className="flex justify-between items-center mb-4">
        <Link href="/admin/products/categories">
          <Button className="bg-black text-white">Go to Categories &gt;</Button>
        </Link>

        <Button
          className="bg-black text-white"
          onClick={() => {
            setShowModal(true);
            resetForm();
          }}
        >
          Add New Product
        </Button>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="overflow-x-auto bg-white shadow-md rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Subcategory</TableCell>
                <TableCell>Created At</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product._id}>
                  <TableCell>{product.name.toLocaleUpperCase()}</TableCell>
                  <TableCell>${product.price}</TableCell>
                  <TableCell>
                    {
                      categories.find((cat) => cat._id === product.category)
                        ?.name.toLocaleUpperCase()
                    }
                  </TableCell>
                  <TableCell>{product.subcategory?.toLocaleUpperCase()}</TableCell>
                  <TableCell>
                    {new Date(product.createdAt).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditProductId(product._id);
                          setProductName(product.name);
                          setPrice(product.price.toString());
                          setCategory(product.category);
                          setSubcategory(product.subcategory || "");
                          setImageLinks(product.images);
                          setShowModal(true);
                          setError("");
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-white bg-black"
                        onClick={() => setDeleteProductId(product._id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="bg-black text-white">
          <DialogHeader>
            <DialogTitle>
              {editProductId ? "Edit Product" : "Add New Product"}
              {error && (
                <p className="text-red-500 mb-4 mt-4 text-center">{error}</p>
              )}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Product Name"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
            />
            <Input
              placeholder="Price"
              value={price.toString()}
              onChange={(e) => setPrice(e.target.value)}
              type="number"
            />
            <Select value={category} onValueChange={(val) => setCategory(val)}>
              <SelectTrigger>
                <SelectValue placeholder="Select Category" />
              </SelectTrigger>
              <SelectContent className="bg-black text-white">
                {categories.map((cat) => (
                  <SelectItem key={cat._id} value={cat._id}>
                    {cat.name.toLocaleUpperCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {category && (
              <Select
                value={subcategory}
                onValueChange={(val) => setSubcategory(val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Subcategory" />
                </SelectTrigger>
                <SelectContent className="bg-black text-white">
                  {categories
                    .find((cat) => cat._id === category)
                    ?.subcategories.map((sub) => (
                      <SelectItem key={sub} value={sub}>
                        {sub}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            )}
            <Input type="file" multiple onChange={handleFileChange} />
            {isUploading && <div>Uploading...</div>}
            <div className="flex flex-wrap gap-2">
              {imageLinks.map((link, index) => (
                <div key={index} className="relative">
                  <Image
                    src={link}
                    alt="Product Image"
                    width={100}
                    height={100}
                    className="rounded-md"
                  />
                  <button
                    onClick={() => handleRemoveImage(index, link)}
                    className="absolute top-0 right-0 text-red-500"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            <Button
              onClick={handleAddOrUpdateProduct}
              className="bg-white text-black"
            >
              {editProductId ? "Update Product" : "Add Product"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!deleteProductId}
        onOpenChange={() => setDeleteProductId(null)}
      >
        <DialogContent className="bg-black text-white">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete this product?</p>
          <div className="flex justify-end gap-2 mt-4">
            <Button
              onClick={handleDeleteProduct}
              className="bg-white text-black"
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductsPage;
