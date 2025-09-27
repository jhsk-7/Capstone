"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import { useRouter } from "next/navigation";
import { normalizeError } from "@/helpers/newErrorHandler";

export default function BikesPage() {
  const [bikes, setBikes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchBikes = async () => {
      try {
        const res = await axios.get("/api/bikes/myBikes", { withCredentials: true });
        setBikes(res.data.data || []);
      } catch (err) {
        const findStatus = async () => {
          const { status, message} = normalizeError(err);
          setError(message);
        };
        await findStatus();
      } finally {
        setLoading(false);
      }
    };
    fetchBikes();
  }, []);

  // --- Loading skeletons ---
  if (loading) {
    return (
      <div className="p-6 max-w-xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">My Bikes</h1>
          <div className="h-9 w-28 rounded bg-gray-200 animate-pulse" />
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="border p-4 rounded flex items-center gap-4">
              <div className="w-24 h-24 rounded bg-gray-200 animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-40 bg-gray-200 rounded animate-pulse" />
                <div className="h-3 w-56 bg-gray-200 rounded animate-pulse" />
                <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // --- Error state ---
  if (error) {
    return (
      <div className="p-6 max-w-xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">My Bikes</h1>
          <Link
            href="/addBike"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Add Bike
          </Link>
        </div>
        <div className="p-4 border border-red-300 bg-red-50 rounded text-red-700">
          {error}
        </div>
      </div>
    );
  }

  // --- Empty state ---
  if (bikes.length === 0) {
    return (
      <div className="p-6 max-w-xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">My Bikes</h1>
          <Link
            href="/addBike"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Add Bike
          </Link>
        </div>
        <div className="border p-4 rounded">
          <p className="text-gray-700">No bikes found.</p>
          <p className="text-sm text-gray-600 mt-1">
            Add your first bike to start booking services.
          </p>
          <Link
            href="/addBike"
            className="inline-block mt-3 text-sm bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700"
          >
            Add Bike
          </Link>
        </div>
      </div>
    );
  }

  // --- List ---
  return (
    <div className="p-6 max-w-xl mx-auto">
      <div className="fixed left-4 top-24 z-40">
        <Link
          href="/addBike"
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 shadow"
        >
          Add Bike
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold mb-4">My Bikes</h1>
        <p className="text-sm text-gray-500 mb-4">View your bikes collection.</p>
      </div>

      <div className="space-y-4">
        {bikes.map((bike) => {
          const id =
            typeof bike._id === "string"
              ? bike._id
              : bike?._id?.$oid ?? "";

          return (
            <div
              key={id}
              onClick={() => router.push(`/myBikes/${id}`)}
              className="border p-4 rounded flex items-center gap-4 cursor-pointer hover:bg-blue-600"
            >
              {/* Image / placeholder */}
              {bike.picture ? (
                <img
                  src={bike.picture}
                  alt={bike.nickname || "Bike"}
                  className="w-24 h-24 object-cover rounded"
                />
              ) : (
                <div className="w-24 h-24 rounded bg-gray-100 flex items-center justify-center">
                  <svg
                    viewBox="0 0 24 24"
                    className="w-10 h-10 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >
                    <circle cx="6.5" cy="17.5" r="3.5" />
                    <circle cx="17.5" cy="17.5" r="3.5" />
                    <path d="M6.5 17.5l5-9h3l3 5M9 13h8" />
                  </svg>
                </div>
              )}

              {/* Details */}
              <div>
                <h2 className="text-lg font-semibold">{bike.nickname || "My Bike"}</h2>
                {(bike.brand || bike.make || bike.model) && (
                  <p className="text-sm text-gray-700">
                    {(bike.brand || bike.make) ?? ""} {bike.model ?? ""}
                  </p>
                )}
                {bike.color && (
                  <p className="text-sm text-gray-700">Color: {bike.color}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
