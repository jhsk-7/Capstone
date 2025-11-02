"use client";

import AddBikeForm from "./AddBikeForm";
import Link from "next/link";
import { useAppContext } from "@/app/appContext";

export default function AddBikePage() {
  const { isDarkMode } = useAppContext(); 
  
  return (
    <div className={`min-h-[calc(100vh-4rem)] p-6 ${isDarkMode ? null : "bg-white"}`}>    
      <div className="fixed left-4 top-24 z-40">
        <Link
          href="/user/myBikes"
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 shadow"
          aria-label="Go to My Bikes"
        >
          My Bikes
        </Link>
      </div>

      <div className="p-6 max-w-xl mx-auto">
        <h1 className={`text-2xl font-bold mb-4 ${isDarkMode? null : "text-gray-900"}`}>Add Bike</h1>
        <p className={`mb-4 ${isDarkMode? null : "text-gray-900"}`}>
          Fill out form to create a new bike.
        </p>

        <div className="mb-6">   
          <AddBikeForm/>
        </div>
      </div>
    </div>
)};
