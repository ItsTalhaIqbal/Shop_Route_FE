"use client";
import React, { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
} from "@/components/ui/dialog";
import { baseURL } from "@/utils/baseURL";
import { useRouter } from "next/navigation";
import { isLogin } from "@/utils/Auth";

type User = {
  _id: string;
  username: string;
  email: string;
  role: string;
  createdAt: string;
};

const UsersPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [editUserId, setEditUserId] = useState<string | null>(null);
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);

  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [role, setRole] = useState<string>("user");

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
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${baseURL}/api/user`);
        setUsers(response.data.response);
      } catch (error) {
      alert("Error Fetching users .")

      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleEditUser = async () => {
    try {
      const response = await axios.put(`${baseURL}/api/user/${editUserId}`, {
        name,
        email,
        role,
      });
      setUsers((prev) =>
        prev.map((user) =>
          user._id === editUserId ? response.data.response : user
        )
      );
      setEditUserId(null);
    } catch (error) {
      alert("Error Editing user .")
    }
  };

  const handleDeleteUser = async () => {
    try {
      await axios.delete(`${baseURL}/api/user/${deleteUserId}`);
      setUsers((prev) => prev.filter((user) => user._id !== deleteUserId));
      setDeleteUserId(null);
    } catch (error) {
      alert("Error deleting user .")
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Users</h1>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="overflow-x-auto bg-white shadow-md rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Created At</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user._id}>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>
                    {new Date(user.createdAt).toLocaleString()}
                  </TableCell>
                  <TableCell className="flex gap-2">
                    <Dialog
                      open={editUserId === user._id}
                      onOpenChange={(open) => {
                        if (open) {
                          setEditUserId(user._id);
                          setName(user.username);
                          setEmail(user.email);
                          setRole(user.role);
                        } else {
                          setEditUserId(null);
                        }
                      }}
                    >
                      <DialogTrigger asChild>
                        <Button variant="outline">Edit</Button>
                      </DialogTrigger>
                      <DialogContent className="bg-black text-white border-black">
                        <DialogHeader>
                          <DialogTitle>Edit User</DialogTitle>
                        </DialogHeader>
                       
                        <Select
                          value={role}
                          onValueChange={(value) => setRole(value)}
                        >
                          <SelectTrigger className="w-full p-2  rounded-md mt-2">
                            <SelectValue placeholder="Select Role" />
                          </SelectTrigger>
                          <SelectContent className="bg-black text-white">
                            <SelectItem value="salesman">Salesman</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          className="w-full mt-4 bg-white text-black"
                          onClick={handleEditUser}
                        >
                          Update User
                        </Button>
                      </DialogContent>
                    </Dialog>

                    <Dialog
                      open={deleteUserId === user._id}
                      onOpenChange={(open) => {
                        if (open) {
                          setDeleteUserId(user._id);
                        } else {
                          setDeleteUserId(null);
                        }
                      }}
                    >
                      <DialogTrigger asChild>
                        <Button
                          variant="destructive"
                          className="bg-black text-white"
                        >
                          Delete
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-black text-white border-black">
                        <DialogHeader>
                          <DialogTitle>Delete User</DialogTitle>
                        </DialogHeader>
                        <p>Are you sure you want to delete this user?</p>
                        <Button
                          className="w-full mt-4 bg-white text-black"
                          onClick={handleDeleteUser}
                        >
                          Yes, Delete
                        </Button>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default UsersPage;
