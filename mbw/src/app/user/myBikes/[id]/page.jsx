"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import Link from "next/link";
import { normalizeError } from "@/helpers/newErrorHandler";
import { useAppContext } from "@/app/appContext";

export default function BikeDetailPage() {
  const { setNavContext, isDarkMode } = useAppContext();   
  const { id } = useParams();
  const router = useRouter();

  const [bike, setBike] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showConfirm, setShowConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [actionError, setActionError] = useState("");

  useEffect(() => {
    setNavContext('userIn');
  }, []);

  useEffect(() => {
    const fetchBike = async () => {
      try {
        const res = await axios.get(`/api/users/bikes/myBikes/${id}`, {
          withCredentials: true,
        });
        setBike(res.data.data);
      } catch (err) {
        const findStatus = async () => {
          const { message} = normalizeError(err);
          setError(message);
        };
        await findStatus();
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchBike();
  }, [id]);

  const handleDelete = async () => {
    try {
      setDeleting(true);
      setActionError("");
      await axios.delete(`/api/users/bikes/myBikes/${id}?cascade=1`, {
        withCredentials: true,
      });
      router.push("/user/myBikes?deleted=1");
    } catch (err) {
      setActionError(err.response?.data?.error || err.message || "Failed to delete bike");
      setDeleting(false);
    }
  };

  if (loading) {
    return (
    <div className={`min-h-[calc(100vh-4rem)] p-6 ${isDarkMode ? null : "bg-white"}`}>
      <div className="p-6 max-w-xl mx-auto">Loading bike…</div>;
    </div>  
  )}


  if (error) {
    return (
      <div className={`min-h-[calc(100vh-4rem)] p-6 ${isDarkMode ? null : "bg-white"}`}>
      <div className="p-6 max-w-xl mx-auto">
        <div className="fixed left-4 top-24 z-40">
          <Link
            href="/user/myBikes"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 shadow"
          >
            Back to My Bikes
          </Link>
        </div>
        <div className="p-4 border border-red-300 bg-red-50 rounded text-red-700">
          {error}
        </div>
      </div>
      </div>
    );
  }


  if (!bike) {
    return (
      <div className={`min-h-[calc(100vh-4rem)] p-6 ${isDarkMode ? null : "bg-white"}`}>
      <div className="p-6 max-w-xl mx-auto">
        <p className={`${isDarkMode ? null : "text-gray-900"}`}>Bike not found.</p>
        <Link href="/user/myBikes" className="text-blue-600 underline mt-4 block">
          Back to My Bikes
        </Link>
      </div>
      </div>
    );
  }

  return (
    <div className={`min-h-[calc(100vh-4rem)] p-6 ${isDarkMode ? null : "bg-white"}`}>
    <div className="p-6 max-w-xl mx-auto">
      {/* Left-side fixed back button */}
      <div className="fixed left-4 top-24 z-40">
        <Link
          href="/user/myBikes"
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 shadow"
        >
          Back to My Bikes
        </Link>
      </div>

      {/* Header + actions */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <h1 className={`text-2xl font-bold ${isDarkMode ? null : "text-gray-900"}`}>{bike.nickname || "My Bike"}</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowConfirm(true)}
            className="px-3 py-2 rounded bg-gray-200 border border-gray-900 text-gray-900 hover:bg-red-400"
          >
            Delete
          </button>
        </div>
      </div>

      {/* Gentle inline warning under actions */}
      <div className={`mb-4 text-sm ${isDarkMode ? null : "text-gray-900"}`}>
        Deleting this bike will also delete any appointments where this bike is included. This action cannot be undone.
      </div>

      {/* Bike details */}
      <div className="space-y-3">
        {bike.picture && (
          <img
            src={bike.picture}
            alt={bike.nickname || "Bike"}
            className="w-full h-64 object-cover rounded border border-gray-900"
          />
        )}
        <p className={`${isDarkMode ? null : "text-gray-900"}`}>
          {bike.make} {bike.model}
        </p>
        {bike.color && <p className={`${isDarkMode ? null : "text-gray-900"}`}>Color: {bike.color}</p>}
      </div>

      {/* Confirm Delete Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow">
            <h2 className="text-lg text-gray-900 font-semibold">Delete bike?</h2>
            <p className="mt-2 text-sm text-gray-900">
              You’re about to permanently delete{" "}
              <span className="font-medium">{bike.nickname || "this bike"}</span>.{" "}
              This will also delete any appointments where this bike exists. This action cannot be undone.
            </p>

            {actionError && (
              <div className="mt-3 rounded border border-red-200 bg-red-50 p-2 text-sm text-red-700">
                {actionError}
              </div>
            )}

            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                onClick={() => setShowConfirm(false)}
                disabled={deleting}
                className="px-3 py-2 rounded border border-gray-900 text-gray-900 bg-gray-100 hover:bg-white disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-3 py-2 rounded border border-gray-900 bg-red-400 text-gray-900 hover:bg-red-500 disabled:opacity-50"
              >
                {deleting ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </div>
  );
}
