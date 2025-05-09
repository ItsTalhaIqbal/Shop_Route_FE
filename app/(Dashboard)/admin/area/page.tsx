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
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { baseURL } from "@/utils/baseURL";
import { isLogin } from "@/utils/Auth";
import { useRouter } from "next/navigation";

type City = {
  _id: string;
  name: string;
};

type Area = {
  _id: string;
  name: string;
  city: string;
  createdAt?: string;
};

const AreaPage = () => {
  const [areas, setAreas] = useState<Area[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [deleteAreaId, setDeleteAreaId] = useState<string | null>(null);
  const [error, setError] = useState<String>("");
  const [editArea, setEditArea] = useState<Area | null>(null);
  const [newAreaName, setNewAreaName] = useState<string>("");
  const [selectedCityId, setSelectedCityId] = useState<string>("");

  const router = useRouter();

  useEffect(() => {
    if (editArea && cities.length > 0) {
      setSelectedCityId(editArea.city);
    }
  }, [editArea, cities]);

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
    const fetchData = async () => {
      try {
        const areaResponse = await axios.get(`${baseURL}/api/area`);
        const cityResponse = await axios.get(`${baseURL}/api/city`);
        setAreas(areaResponse.data.response);
        setCities(cityResponse.data.response);
      } catch (error) {
        alert("Error fetching data,Please Try Again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleAddArea = async () => {
    const duplicateArea = areas.find(
      (area) =>
        area.name.toLowerCase() == newAreaName.trim().toLowerCase() &&
        area.city == selectedCityId
    );

    if (duplicateArea) {
      setError("Area with the Same name for this city Already exists");
      return;
    }

    try {
      if (!selectedCityId.trim() || !newAreaName.trim()) {
        setError("Please enter Area name & select city");
        return;
      }
      if (newAreaName.trim().length < 3) {
        setError("Area name atleast 3 cheracters long.");
        return;
      }
      const newArea = {
        name: newAreaName.trim().toLowerCase(),
        city: selectedCityId,
      };
      const response = await axios.post(`${baseURL}/api/area`, newArea);
      setAreas((prev) => [response.data.response, ...prev]);
      setShowAddModal(false);
      setNewAreaName("");
      setSelectedCityId("");
      setError("");
    } catch (error) {
      alert("Error adding area , Please try again.");
    }
  };

  const handleEditArea = async () => {
    if (!selectedCityId.trim() || !newAreaName.trim()) {
      setError("Please enter Area name & Select city ");
      return;
    }
    if (!cities.find((city) => city._id === selectedCityId)) {
      setError("Invalid city selected");
      return;
    }
    const duplicateArea = areas.find(
      (area) =>
        area.name.toLowerCase() === newAreaName.trim().toLowerCase() &&
        area.city === selectedCityId &&
        area._id !== editArea?._id
    );

    if (duplicateArea) {
      setError("Area with the same name for this city already exists");
      return;
    }
    try {
      if (newAreaName.trim().length < 3) {
        setError("Area name must be at least 3 characters long.");
        return;
      }
      const updatedArea = {
        name: newAreaName.trim().toLowerCase(),
        city: selectedCityId,
      };
      const response = await axios.put(
        `${baseURL}/api/area/${editArea?._id}`,
        updatedArea
      );
      setAreas((prev) =>
        prev.map((area) =>
          area._id === editArea?._id ? response.data.response : area
        )
      );
      setShowEditModal(false);
      setEditArea(null);
      setNewAreaName("");
      setSelectedCityId("");
      setError("");
    } catch (error) {
      alert("Error updating area, please try again.");
    }
  };
  const handleDeleteArea = async () => {
    try {
      if (!deleteAreaId) return;
      await axios.delete(`${baseURL}/api/area/${deleteAreaId}`);
      setAreas((prev) => prev.filter((area) => area._id !== deleteAreaId));
      setShowDeleteModal(false);
      setDeleteAreaId(null);
    } catch (error) {
      alert("Error deleting area");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-white">Areas</h1>

      <div className="flex justify-end mb-4">
        <Button
          variant="ghost"
          className="text-lg bg-black text-white rounded-sm"
          onClick={() => {
            setShowAddModal(true);
            setError("");
            setSelectedCityId("");
            setNewAreaName("");
          }}
        >
          Add New Area
        </Button>
      </div>

      {loading ? (
        <div className="text-white">Loading...</div>
      ) : (
        <div className="overflow-x-auto bg-white shadow-md rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableCell>Area Name</TableCell>
                <TableCell>City Name</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {areas.map((area) => (
                <TableRow key={area._id}>
                  <TableCell>{area.name.toLocaleUpperCase()}</TableCell>
                  <TableCell>
                    {cities
                      .find((city) => city._id === area.city)
                      ?.name.toLocaleUpperCase() || "N/A"}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className=""
                        onClick={() => {
                          setEditArea(area);
                          setNewAreaName(area.name);
                          setSelectedCityId(area.city);

                          setShowEditModal(true);
                          setError("");
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        className="bg-black text-white"
                        onClick={() => {
                          setDeleteAreaId(area._id);
                          setShowDeleteModal(true);
                        }}
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

      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="bg-black text-white border-black rounded-lg">
          <DialogHeader>
            <DialogTitle>Add New Area</DialogTitle>
            {error && (
              <p className="text-red-500 my-4 font-semibold text-center">
                {error}
              </p>
            )}
          </DialogHeader>
          <input
            type="text"
            value={newAreaName}
            onChange={(e) => setNewAreaName(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md mt-2 text-white bg-black"
            placeholder="Enter area name"
          />
          <Select value={selectedCityId} onValueChange={setSelectedCityId}>
            <SelectTrigger className="mt-2">
              <SelectValue placeholder="Select a city" />
            </SelectTrigger>
            <SelectContent className="bg-black text-white">
              {cities.map((city) => (
                <SelectItem key={city._id} value={city._id}>
                  {city.name.toUpperCase()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            className="w-full mt-4 bg-white text-black"
            onClick={handleAddArea}
          >
            Add Area
          </Button>
        </DialogContent>
      </Dialog>

      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="bg-black text-white border-black rounded-lg">
          <DialogHeader>
            <DialogTitle>Edit Area</DialogTitle>
            {error && (
              <p className="text-red-500 my-4 font-semibold text-center">
                {error}
              </p>
            )}
          </DialogHeader>
          <input
            type="text"
            value={newAreaName}
            onChange={(e) => setNewAreaName(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md mt-2 text-white bg-black"
            placeholder="Enter area name"
          />
          <Select value={selectedCityId} onValueChange={setSelectedCityId}>
            <SelectTrigger className="mt-2">
              <SelectValue placeholder="Select a city" />
            </SelectTrigger>
            <SelectContent className="bg-black text-white">
              {cities.map((city) => (
                <SelectItem key={city._id} value={city._id}>
                  {city.name.toUpperCase()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            className="w-full mt-4 bg-white text-black"
            onClick={handleEditArea}
          >
            Update Area
          </Button>
        </DialogContent>
      </Dialog>

      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent className="bg-black text-white border-black rounded-lg">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete this area?</p>
          <div className="flex justify-end gap-4 mt-4">
            <Button
              variant="ghost"
              className="bg-white text-black"
              onClick={() => setShowDeleteModal(false)}
            >
              Cancel
            </Button>
            <Button
              className="bg-red-500 text-white"
              onClick={handleDeleteArea}
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AreaPage;
