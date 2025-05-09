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

type Shop = {
  _id: string;
  name: string;
  ownername: string;
  contact: string;
  city: string;
  area: string;
  createdAt: string;
};

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

const ShopsPage = () => {
  const [shops, setShops] = useState<Shop[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [selectedAreas, setSelectedAreas] = useState<Area[]>([]);

  const [loading, setLoading] = useState<boolean>(true);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [confirmDelete, setConfirmDelete] = useState<boolean>(false);
  const [shopToDelete, setShopToDelete] = useState<string | null>(null);
  const [shopName, setShopName] = useState<string>("");
  const [contact, setContact] = useState<string>("");
  const [ownerName, setOwnerName] = useState("");
  const [city, setCity] = useState<string>("");
  const [area, setArea] = useState<string>("");
  const [editShopId, setEditShopId] = useState<string | null>(null);
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
    const fetchData = async () => {
      try {
        const [shopRes, cityRes, areaRes] = await Promise.all([
          axios.get(`${baseURL}/api/shop`),
          axios.get(`${baseURL}/api/city`),
          axios.get(`${baseURL}/api/area`),
        ]);
        setAreas(areaRes.data.response);
        setShops(shopRes.data.response);
        setCities(cityRes.data.response);
      } catch (error) {
        alert("Error fetching data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSelectedCity = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCity = e.target.value;
    const filterAreas = areas.filter((area) => area.city === selectedCity);
    setSelectedAreas(filterAreas);
    setCity(selectedCity);
    setArea("");
  };

  const handleAddOrEditShop = async () => {
    if (!shopName || !ownerName || !city || !area || !contact) {
      setError("All fields are required");
      return;
    }
    if (shopName.trim().length < 3) {
      setError("Shop Name must be at least 3 characters long.");
      return;
    }
    if (ownerName.trim().length < 3) {
      setError("Owner's Name must be at least 3 characters long.");
      return;
    }
    const hasNonDigits = /[^0-9]/.test(contact);
    const cleanedNumber = contact.replace(/[^0-9]/g, "");
    const regex = /^03[0-9]{2}[0-9]{7}$/;
    const passedContact = regex.test(cleanedNumber);
    
    if (hasNonDigits || !passedContact) {
        setError("Contact Format is Not Correct. Must be a 11-digit number starting with 03, containing only digits.");
        return;
    }
    try {
      const shopData = {
        name: shopName.trim().toLowerCase(),
        ownername: ownerName.trim(),
        contact: contact,
        city: city.trim(),
        area: area.trim(),
      };

      const duplicateShop = shops.find(
        (shop) =>
          shop.name === shopData.name &&
          shop.city === shopData.city &&
          shop.area === shopData.area
      );

      if (duplicateShop && (!editShopId || duplicateShop._id !== editShopId)) {
        setError("Shop with this name, city, and area already exists.");
        return;
      }

      if (editShopId) {
       const res = await axios.put(`${baseURL}/api/shop/${editShopId}`, shopData);
        setShops((prev) =>
          prev.map((shop) =>
            shop._id === editShopId ? { ...shop, ...shopData } : shop
          )
        );
      } else {
        const response = await axios.post(`${baseURL}/api/shop`, shopData);
        const newShop = response.data.response;
        setShops((prev) => [newShop, ...prev]);
      }

      setShowModal(false);
      resetForm();
    } catch (error) {
      setError("An error occurred while saving the shop. Please try again.");
    }
  };

  const handleDeleteShop = async () => {
    try {
      if (shopToDelete) {
        await axios.delete(`${baseURL}/api/shop/${shopToDelete}`);
        setShops((prev) => prev.filter((shop) => shop._id !== shopToDelete));
      }
    } catch (error) {
      alert("Error deleting shop");
    } finally {
      setConfirmDelete(false);
      setShopToDelete(null);
    }
  };

  const resetForm = () => {
    setShopName("");
    setContact("");
    setOwnerName("");
    setCity("");
    setArea("");
    setSelectedAreas([]);
    setError("");
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Shops</h1>
      <div className="flex justify-end mb-4">
        <Button
          variant="ghost"
          className="text-lg bg-black text-white rounded-sm ml-3"
          onClick={() => {
            setShowModal(true);
            resetForm();
          }}
        >
          Add New Shop
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
                <TableCell>Contact</TableCell>
                <TableCell>City</TableCell>
                <TableCell>Area</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {shops.map((shop) => {
                const cityName =
                  cities
                    .find((city) => city._id === shop.city)
                    ?.name.toUpperCase() || "Unknown City";
                const areaName =
                  areas
                    .find((area) => area._id === shop.area)
                    ?.name.toUpperCase() || "Unknown Area";
                return (
                  <TableRow key={shop._id}>
                    <TableCell>{shop.name.toLocaleUpperCase()}</TableCell>
                    <TableCell>{shop.contact}</TableCell>
                    <TableCell>{cityName}</TableCell>
                    <TableCell>{areaName}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          className="text-black px-2"
                          onClick={() => {
                            setShowModal(true);
                            setEditShopId(shop._id);
                            setShopName(shop.name);
                            setOwnerName(shop.ownername);
                            setContact(shop.contact.toString());
                            setCity(shop.city);
                            setArea(shop.area);
                            const filterAreas = areas.filter(
                              (area) => area.city === shop.city
                            );
                            setSelectedAreas(filterAreas);
                            setError("");
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          className="bg-black text-white px-2"
                          onClick={() => {
                            setConfirmDelete(true);
                            setShopToDelete(shop._id);
                          }}
                        >
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
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
            <DialogTitle>
              {editShopId ? "Edit Shop" : "Add New Shop"}
            </DialogTitle>
            {error && (
              <p className="text-red-500 my-4 font-semibold text-center">
                {error}
              </p>
            )}
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label htmlFor="shopName" className="block text-sm">
                Shop Name
              </label>
              <input
                id="shopName"
                type="text"
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md mt-1 text-white bg-black"
                placeholder="Shop Name"
              />
            </div>
            <div>
              <label htmlFor="ownerName" className="block text-sm">
                Owner Name
              </label>
              <input
                id="ownerName"
                type="text"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md mt-1 text-white bg-black"
                placeholder="Owner Name"
              />
            </div>
            <div>
              <label htmlFor="contact" className="block text-sm">
                Contact Number
              </label>
              <input
                type="text"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md mt-1 text-white bg-black"
                placeholder="03xx-xxxxxxx"
              />
            </div>
            <div>
              <label htmlFor="city" className="block text-sm">
                City
              </label>
              <select
                id="city"
                value={city}
                onChange={handleSelectedCity}
                className="w-full p-2 border border-gray-300 rounded-md mt-1 text-white bg-black"
              >
                <option value="">Select City</option>
                {cities.map((city) => (
                  <option key={city._id} value={city._id}>
                    {city.name.toLocaleUpperCase()}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="area" className="block text-sm">
                Area
              </label>
              <select
                id="area"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md mt-1 text-white bg-black"
              >
                <option value="">Select Area</option>
                {selectedAreas.map((area) => (
                  <option key={area._id} value={area._id}>
                    {area.name.toLocaleUpperCase()}
                  </option>
                ))}
              </select>
            </div>
            <Button
              className="w-full mt-4 bg-white text-black"
              onClick={handleAddOrEditShop}
            >
              {editShopId ? "Update Shop" : "Add Shop"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <DialogTrigger asChild>
          <Button className="hidden">Open Confirmation</Button>
        </DialogTrigger>
        <DialogContent className="bg-black text-white border-black rounded-lg">
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete this shop?</p>
          <div className="flex justify-end space-x-2 mt-4">
            <Button className="bg-white text-black" onClick={handleDeleteShop}>
              Confirm
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ShopsPage;
