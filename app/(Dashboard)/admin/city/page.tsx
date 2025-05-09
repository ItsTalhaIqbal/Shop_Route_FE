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
import { baseURL } from "@/utils/baseURL";
import { useRouter } from "next/navigation";
import { isLogin } from "@/utils/Auth";

type City = {
  _id: string;
  name: string;
  createdAt: string;
};

const CityPage = () => {
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [newCityName, setNewCityName] = useState<string>("");
  const [editCityId, setEditCityId] = useState<string | null>(null);
  const [editCityName, setEditCityName] = useState<string>("");
  const [deleteCityId, setDeleteCityId] = useState<string | null>(null);
  const [error, setError] = useState<String>("");

  const router = useRouter();

  useEffect(()=>{
    if(showModal){
      setNewCityName("")
    }
  },[showModal])

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
    const fetchCities = async () => {
      try {
        const response = await axios.get(`${baseURL}/api/city`);
        setCities(response.data.response);
      } catch (error) {
      alert("Error fetching cities")
      } finally {
        setLoading(false);
      }
    };

    fetchCities();
  }, []);

  const handleAddCity = async () => {
    const duplicateCity = cities.find(
      (city) => city.name.toLowerCase() == newCityName.trim().toLowerCase()
    );
    if (duplicateCity) {
      setError("City exist With the same name already");
      return;
    }
    try {
      if (!newCityName.trim()) {
        setError("Please Enter City Name");
        return;
      }
      if(newCityName.trim().length < 3){
        setError("City name atleast 3 cheracters long")
        return
      }
      const newCity = { name: newCityName.trim().toLowerCase() };

      const response = await axios.post(`${baseURL}/api/city`, newCity);
      setCities((prev) => [response.data.response, ...prev]);
      setShowModal(false);
      setNewCityName("");
      setError("");
    } catch (error) {
    setError("Error adding city, Please try again.")
    
    }
  };

  const handleDeleteCity = async () => {
    if (deleteCityId) {
      try {
        await axios.delete(`${baseURL}/api/city/${deleteCityId}`);
        setCities((prev) => prev.filter((city) => city._id !== deleteCityId));
        setDeleteCityId(null);
      } catch (error) {
        alert("Error deleting city , Please Try again.")
     
      }
    }
  };

  const handleEditCity = async () => {
    const duplicateCity = cities.find(
      (city) =>
        city.name.toLowerCase() == editCityName.trim().toLowerCase() &&
        city._id !== editCityId
    );
    if (duplicateCity) {
      setError("City exist With the same name already");
      return;
    }
    if (editCityId) {
      try {
        if (!editCityName.trim()) {
          setError("Please Enter City Name");
          return;
        }
        if(editCityName.trim().length < 3){
          setError("City name atleast 3 cheracters long")
          return
        }
        const updatedCity = { name: editCityName.trim().toLowerCase() };
        await axios.put(`${baseURL}/api/city/${editCityId}`, updatedCity);
        setCities((prev) =>
          prev.map((city) =>
            city._id === editCityId ? { ...city, name: editCityName } : city
          )
        );
        setEditCityId(null);
        setError("");
      } catch (error) {
        setError("Error updating city , Please Try again .")
  
      }
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Cities</h1>

      <div className="flex justify-end mb-4">
        <Button
          variant="ghost"
          className="text-lg bg-black text-white rounded-sm ml-3"
          onClick={() => {
            setShowModal(true);
            setError("");
          }}
        >
          Add New City
        </Button>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="overflow-x-auto bg-white shadow-md rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableCell>City Name</TableCell>
                <TableCell>Created At</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cities?.map((city) => (
                <TableRow key={city._id}>
                  <TableCell>{city.name.toLocaleUpperCase()}</TableCell>
                  <TableCell>
                    {new Date(city.createdAt).toLocaleString()}
                  </TableCell>
                  <TableCell className="flex gap-2">
                    <Dialog
                      open={editCityId === city._id}
                      onOpenChange={(open) => {
                        if (open) {
                          setEditCityId(city._id);
                          setEditCityName(city.name);
                        } else {
                          setEditCityId(null);
                        }
                      }}
                    >
                      <DialogTrigger asChild>
                        <Button variant="outline" onClick={()=> setError("")}>Edit</Button>
                      </DialogTrigger>
                      <DialogContent className="bg-black text-white border-black">
                        <DialogHeader>
                          <DialogTitle>Edit City</DialogTitle>
                          {error && (
                            <p className="text-red-500 my-4 font-semibold text-center">
                              {error}
                            </p>
                          )}
                        </DialogHeader>
                        <input
                          type="text"
                          value={editCityName}
                          onChange={(e) => setEditCityName(e.target.value)}
                          className="w-full p-2 border text-white border-gray-300 rounded-md mt-2 text-black"
                        />
                        <Button
                          className="w-full mt-4 bg-white text-black"
                          onClick={handleEditCity}
                        >
                          Update City
                        </Button>
                      </DialogContent>
                    </Dialog>

                    <Button
                      variant="destructive"
                      className="bg-black text-white"
                      onClick={() => setDeleteCityId(city._id)}
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

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogTrigger asChild>
          <Button className="hidden">Open Modal</Button>
        </DialogTrigger>
        <DialogContent className="bg-black text-white border-black rounded-lg">
          <DialogHeader>
            <DialogTitle>Add New City</DialogTitle>
            {error && <p className="text-red-500 font-semibold my-4 text-center">{error}</p>}
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <input
                type="text"
                value={newCityName}
                onChange={(e) => setNewCityName(e.target.value)}
                className="w-full p-2 border border-gray-300 text-white rounded-md mt-2 text-black"
                placeholder="Enter city name"
              />
            </div>
            <Button
              className="w-full mt-4 bg-white text-black"
              onClick={handleAddCity}
            >
              Add City
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={deleteCityId !== null}
        onOpenChange={(open) => setDeleteCityId(null)}
      >
        <DialogTrigger asChild>
          <Button className="hidden">Open Modal</Button>
        </DialogTrigger>
        <DialogContent className="bg-black text-white rounded-lg">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete this city?</p>
          <div className="flex justify-end gap-2 mt-4">
            <Button
              className="w-full bg-white text-black"
              variant="destructive"
              onClick={handleDeleteCity}
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CityPage;
