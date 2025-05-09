"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { isLogin } from "@/utils/Auth";
import axios from "axios";
import { baseURL } from "@/utils/baseURL";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const Page = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [cities, setCities] = useState<any>([]);
  const [areas, setAreas] = useState<any>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");

  useEffect(() => {
    const checkRole = async () => {
      const user = await isLogin();
      if (user?.role !== "salesman") {
        router.push("/login");
      } else {
        setLoading(false);
        fetchAllData();
      }
    };

    const fetchAllData = async () => {
      try {
        const [cityRes, areaRes] = await Promise.all([
          axios.get(`${baseURL}/api/city`),
          axios.get(`${baseURL}/api/area`),
        ]);
        setCities(cityRes.data.response);
        setAreas(areaRes.data.response);
      } catch (error) {
        alert("Error fetching data");
      }
    };

    checkRole();
  }, [router]);

  const filterCities = cities.filter((city: any) =>
    city.name.toLowerCase().includes(searchTerm)
  );

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-4 bg-gray-100 text-black min-h-screen">
      <div className="flex justify-between">
        <h1 className="text-2xl font-bold mb-6">
          Place Orders Based on City.{" "}
        </h1>
        <Input
          placeholder="Search for a product"
          className="bg-gray-200 w-70 text-black"
          value={(searchTerm as any).toLowerCase()}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div className="flex flex-wrap w-full h-full gap-4 p-5 ">
        {filterCities.length > 0 ? (
          filterCities.map((city: any) => (
            <Link href={`/salesman/city/${city._id}`} key={city._id}>
              <Card className="bordr border-black-2  rounded-lg mb-4 w-[100px] h-[100px]  text-center bg-gray-400">
                <p className="my-auto"> {city.name.toUpperCase()}</p>
              </Card>
            </Link>
          ))
        ) : (
          <p>No cities Found.</p>
        )}
      </div>
    </div>
  );
};

export default Page;
