"use client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { baseURL } from "@/utils/baseURL";
import axios from "axios";
import { Link } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

type IAreas = {
  _id: string;
  name: string;
  city: string;
};

const page = () => {
  const {area} = useParams()
  const cityId = area // this area actually is a city id , due to dynamic route it's name changed..
  const [areas, setyAreas] = useState<IAreas[]>([]);
  const [searchAreaTerm,setSearchAreaTerm]= useState<string|null>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchData = async () => {
      const areaRes = await axios.get(`${baseURL}/api/area`);
      setyAreas(areaRes.data.response);
    };
    fetchData();
  }, []);


  const filteredAreas = areas.filter((a)=> a.city == cityId)

  const searchAreas = filteredAreas.filter((area)=> area.name.toLowerCase().includes(searchAreaTerm || ""))

  return (
    <div className="min-h-screen bg-white p-4">
      <div className="flex justify-between mx-10 ">
        <h1 className=" text-2xl font-bold text-black">Areas</h1>
        <Input
          placeholder="Search for a Shop"
          className="bg-gray-200 w-70 text-black "
          value={searchAreaTerm || ""}
          onChange={(e) => setSearchAreaTerm(e.target.value)}
        />
      </div>
      <div className=" h-auto  gap-4 mt-10 flex flex-wrap mx-10">
        {searchAreas.length > 0 ? (searchAreas.map((area) => (
          <Card
            key={area._id}
            className=" text-center w-[150px] bg-gray-200 rounded cursor-pointer"
            onClick={()=> 
              router.push(`/salesman/area/${area._id}`)
             
          }
          >
              <h2 className="text-lg font-semibold" >
                {area.name.toUpperCase()}
              </h2>

          </Card>
        ))) : (
          <p>No Areas found</p>
        )}
      </div>
    </div>
  );
};

export default page;
