"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import axios from "axios";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { baseURL } from "@/utils/baseURL";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { isLogin } from "@/utils/Auth";

type Category = {
  _id: string;
  name: string;
  subcategories: string[];
  createdAt: string;
};

const CategoriesPage = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [categoryName, setCategoryName] = useState<string>("");
  const [editCategoryId, setEditCategoryId] = useState<string | null>(null);
  const [deleteCategoryId, setDeleteCategoryId] = useState<string | null>(null);
  const [subcategories, setSubcategories] = useState<string[]>([]);
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
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${baseURL}/api/category`);
        setCategories(response.data.response);
      } catch (error) {
        alert("Error fetching categories");
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleAddCategory = async () => {
    try {
      if (!categoryName.trim()) {
        setError("Please add a category name");
        return;
      }

      if(categoryName.trim().length < 3){
        setError("Category name atleast 3 cheracters long.")
        return
      }

      const duplicateCategory = categories.find(
        (c) => c.name.toLowerCase() == categoryName.toLowerCase()
      );
      if (duplicateCategory) {
        setError("You cannot add category with same name");
        return;
      }
      
      const newCategory = { name: categoryName.toLowerCase(), subcategories };
      const response = await axios.post(`${baseURL}/api/category`, newCategory);
      setCategories((prev) => [response.data.response, ...prev]);
      setShowModal(false);
      resetForm();
    } catch (error) {
      setError("Error creating Category, Please Try Again!!!");
    }
  };

  const handleEditCategory = async () => {
    try {
      if (!categoryName.trim() || !editCategoryId) {
        setError("Category name is required");
        return;
      }
      
      if(categoryName.trim().length < 3){
        setError("Category name atleast 3 cheracters long.")
        return
      }

      const duplicateCategory = categories.find(
        (c) =>
          c.name.toLowerCase() == categoryName.toLowerCase() &&
          c._id !== editCategoryId
      );
      if (duplicateCategory) {
        setError("You cannot add category with same name");
        return;
      }
      const updatedCategory = { name: categoryName.trim(), subcategories };
      const response = await axios.put(
        `${baseURL}/api/category/${editCategoryId}`,
        updatedCategory
      );
      setCategories((prev) =>
        prev.map((cat) =>
          cat._id === editCategoryId ? response.data.response : cat
        )
      );
      setShowEditModal(false);
      resetForm();
    } catch (error) {
      setError("Error Updating Category, Please Try Again");
    }
  };

  const handleDeleteCategory = async () => {
    try {
      if (!deleteCategoryId) return;
      await axios.delete(`${baseURL}/api/category/${deleteCategoryId}`);
      setCategories((prev) =>
        prev.filter((category) => category._id !== deleteCategoryId)
      );
      setShowDeleteModal(false);
      setDeleteCategoryId(null);
    } catch (error) {
      alert("Error deleting category");
    }
  };

  const resetForm = () => {
    setCategoryName("");
    setSubcategories([]);
    setEditCategoryId(null);
    setError("");
    setShowModal(false);
    setShowEditModal(false);
  };

  const addSubcategory = () => {
    setSubcategories([...subcategories, ""]);
  };

  const updateSubcategory = (index: number, value: string) => {
    const updatedSubcategories = [...subcategories];
    updatedSubcategories[index] = value;
    setSubcategories(updatedSubcategories);
  };

  const handleDeleteSubcategory = (index: number) => {
    const updatedSubcategories = subcategories.filter((_, i) => i !== index);
    setSubcategories(updatedSubcategories);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Categories</h1>
      <div className="flex justify-between items-center mb-4 mt-4">
        <Link href="/admin/products">
          <Button
            variant="outline"
            className="text-lg cursor-pointer bg-black text-white"
          >
            {"< Back to Products"}
          </Button>
        </Link>
        <Button
          variant="ghost"
          className="text-lg bg-black text-white rounded-sm ml-3"
          onClick={() => setShowModal(true)}
        >
          Add New Category
        </Button>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="overflow-x-auto bg-white shadow-md rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableCell>Category Name</TableCell>
                <TableCell>Subcategories</TableCell>
                <TableCell>Created At</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories?.map((category) => (
                <TableRow key={category._id}>
                  <TableCell>{category.name.toUpperCase()}</TableCell>
                  <TableCell>
                    {category.subcategories?.join(", ") || "No subcategories"}
                  </TableCell>
                  <TableCell>
                    {new Date(category.createdAt).toLocaleString()}
                  </TableCell>
                  <TableCell className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setEditCategoryId(category._id);
                        setCategoryName(category.name);
                        setSubcategories(category.subcategories);
                        setShowEditModal(true);
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      className="bg-black text-white"
                      onClick={() => {
                        setDeleteCategoryId(category._id);
                        setShowDeleteModal(true);
                      }}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog
        open={showModal || showEditModal}
        onOpenChange={(isOpen) => {
          setShowModal(isOpen);
          if (!isOpen) resetForm();
        }}
      >
        <DialogContent className="bg-black text-white border-black rounded-lg">
          <DialogHeader>
            <DialogTitle>
              {editCategoryId ? "Edit Category" : "Add New Category"}
              {error && (
                <p className="text-red-500 my-4 font-semibold  text-center">
                  {error}
                </p>
              )}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <input
              type="text"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              className="w-full p-2 bg-black text-white border border-gray-300 rounded-md mt-2"
              placeholder="Enter category name"
            />
            <div>
              <h3 className="text-lg font-semibold">Subcategories</h3>
              {subcategories.map((sub, index) => (
                <div key={index} className="flex gap-2 mt-2">
                  <input
                    type="text"
                    value={sub}
                    onChange={(e) => updateSubcategory(index, e.target.value)}
                    className="w-full p-2 bg-black text-white border border-gray-300 rounded-md"
                    placeholder={`Subcategory ${index + 1}`}
                  />
                  <Button
                    variant="destructive"
                    className="bg-white text-black"
                    onClick={() => handleDeleteSubcategory(index)}
                  >
                    Delete
                  </Button>
                </div>
              ))}
              <Button
                className="mt-4 bg-white text-black"
                onClick={addSubcategory}
              >
                Add Subcategory
              </Button>
            </div>
            <Button
              className="w-full mt-4 bg-white text-black"
              onClick={editCategoryId ? handleEditCategory : handleAddCategory}
            >
              {editCategoryId ? "Update Category" : "Add Category"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={showDeleteModal}
        onOpenChange={(isOpen) => setShowDeleteModal(isOpen)}
      >
        <DialogContent className="bg-black text-white border-black rounded-lg">
          <DialogHeader>
            <DialogTitle>Delete Category</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete this category?</p>
          <div className="flex justify-end gap-2 mt-4">
            <Button
              variant="ghost"
              className="bg-white text-black"
              onClick={() => setShowDeleteModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="bg-red-600 text-white"
              onClick={handleDeleteCategory}
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CategoriesPage;
