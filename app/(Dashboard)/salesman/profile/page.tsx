"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { isLogin } from "@/utils/Auth";

const ProfilePage = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [userInfo, setUserInfo] = useState<any>();
  const [loading, setLoading] = useState(true);
  const [error,setError]=useState<String>("")
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
    const fetchUserInfo = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user") || "null");
        const res = await axios.get(
          `http://localhost:5000/api/user/${user.Id}`
        );
        setUserInfo(res.data.response);
      } catch (error) {
        alert("Error fetching user data")
      } finally {
        setLoading(false);
      }
    };
    fetchUserInfo();
  }, []);

  const saveChanges = async () => {
    if (!userInfo.username || !userInfo.email) {
      setError("Please enter username and email")
      return;
    }
    try {
      await axios.put(
        `http://localhost:5000/api/user/${userInfo._id}`,
        userInfo
      );
      alert("Profile updated successfully!");
      setIsEditing(false);
      setError("")
    } catch (error) {
      alert("Error updating profile:")
    }
  };

  if (loading) {
    return <p className="text-center mt-6">Loading...</p>;
  }

  return (
    <div className="p-6 max-w-xl mx-auto">
      <Card className="bg-black text-white">
        <CardHeader>
          <CardTitle>User Profile</CardTitle>
          <CardDescription>Manage your profile details here.</CardDescription>
          {error && (
                <p className="text-red-500 my-4 font-semibold  text-center">{error}</p>
              )}
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              {isEditing ? (
                <Input
                  id="name"
                  type="text"
                  value={userInfo.username || ""}
                  onChange={(e) =>
                    setUserInfo({ ...userInfo, username: e.target.value })
                  }
                />
              ) : (
                <p className="mt-2">{userInfo.username}</p>
              )}
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              {isEditing ? (
                <Input
                  id="email"
                  type="email"
                  value={userInfo.email || ""}
                  onChange={(e) =>
                    setUserInfo({ ...userInfo, email: e.target.value })
                  }
                />
              ) : (
                <p className="mt-2">{userInfo.email}</p>
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end space-x-4">
          {isEditing ? (
            <>
              <Button
                className="text-black bg-white"
                variant="secondary"
                onClick={() => {
                  setIsEditing(false)
                  setError("")
                }}
              >
                Cancel
              </Button>
              <Button className="text-black bg-white" onClick={saveChanges}>
                Save
              </Button>
            </>
          ) : (
            <Button
              className="text-black bg-white"
              onClick={() => setIsEditing(true)}
            >
              Edit
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default ProfilePage;
