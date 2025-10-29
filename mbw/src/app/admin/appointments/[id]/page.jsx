"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { useAppContext } from "@/app/appContext";
import { normalizeError } from "@/helpers/newErrorHandler";

// Small date formatter to match your list pages
function formatDate(input) {
  try {
    const d = new Date(input);
    if (Number.isNaN(d.getTime())) return String(input);
    return d.toLocaleString(undefined, {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      //hour: "numeric",
      //minute: "2-digit",
    });
  } catch {
    return String(input);
  }
}

export default function AppointmentDetailPage() {
  // Status update handler

  const { isDarkMode } = useAppContext(); 
  const { id } = useParams();
  const [appt, setAppt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState(false);


  useEffect(() => {
    if (!id) return;
    const fetchOne = async () => {
      try {
        const res = await axios.get(`/api/admin/appointments/${id}`, {
          withCredentials: true,
        });
        setAppt(res.data?.data ?? null);
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
    fetchOne();
  }, [id]);

  const handleStatusUpdate = async (status) => {
    if (!id) return;
    setUpdating(true);
    setError("");
    try {
      await axios.patch(`/api/admin/appointments/${id}`, { status }, { withCredentials: true });
      setAppt((prev) => ({ ...prev, status }));
    } catch (err) {
      const { message } = normalizeError(err);
      setError(message);
    } finally {
      setUpdating(false);
    }
  };

  const dateLabel = appt?.date ? formatDate(appt.date) : "";

  // --- Loading skeleton ---
  if (loading) {
    return (
      <div className="p-6 max-w-xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Appointment</h1>
        </div>
        <div className="space-y-4">
          <div className="border p-4 rounded">
            <div className="h-4 w-40 bg-gray-200 rounded animate-pulse mb-3" />
            <div className="h-3 w-56 bg-gray-200 rounded animate-pulse mb-2" />
            <div className="h-3 w-32 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  // --- Error state ---
  if (error) {
    return (
    <div className="p-6 max-w-xl mx-auto">
        <div className="fixed left-4 top-24 z-40">
          <Link
            href="/admin/appointments"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 shadow"
          >
            Back to All Appointments
          </Link>
        </div>
        <div>
          <h1 className="text-2xl font-bold">Appointment</h1>
        </div>
        <div className="p-4 border border-red-300 bg-red-50 rounded text-red-700">
          {error}
        </div>
      </div>
    );
  }

  if (!appt) {
    return (
    <div className="p-6 max-w-xl mx-auto">
      <div className="fixed left-4 top-24 z-40">
          <h1 className="text-2xl font-bold">Appointment</h1>
          <Link
            href="/admin/appointments"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 shadow"
          >
            Back to All Appointments
          </Link>
        </div>
        <div className="text-gray-600">Appointment not found.</div>
      </div>
    );
  }



  return (
    <div className="p-6 max-w-xl mx-auto">
      <div className="fixed left-4 top-24 z-40">
        <Link
          href="/admin/appointments"
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 shadow"
        >
          Back to All Appointments
        </Link>
      </div>

      <h1 className="text-2xl font-bold mb-4">Appointment</h1>
      <p className="text-sm text-gray-500 mb-4">
        Details for this service appointment.
      </p>

      <div className="space-y-3">
        <div className="border p-4 rounded">
          {/* Top row: date + status pill */}
          <div className="flex items-center gap-2 mb-2">

            <span className="text-base font-medium">{dateLabel}</span>
            <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-blue-100 text-blue-700">
              {appt.status || "Pending"}
            </span>
          </div>

            {/* Bikes & Services */}
            <div className="text-sm text-gray-700 space-y-1">
            {Array.isArray(appt.bikes) && appt.bikes.length > 0 ? (
                appt.bikes.map((b, idx) => {
                const nickname =
                    typeof b?.bikeId === "object" ? b.bikeId?.nickname ?? "—" : "—";

                const serviceNames = Array.isArray(b?.services)
                    ? b.services
                        .map((s) => (typeof s === "object" ? s?.name : null))
                        .filter(Boolean)
                        .join(", ")
                    : "";

            const key =
                (typeof b?.bikeId === "object" && (b.bikeId?._id || b.bikeId?.id)) ||
                (typeof b?.bikeId === "string" && b.bikeId) ||
                idx;

                return (
                  <div key={key}>
                    <span className="font-medium">Bike:</span> {nickname}
                    <span className="text-gray-300 mx-2">-</span>
                    <span className="font-medium">Services:</span> {serviceNames}
                  </div>
                );
              })
            ) : (
              <div>No bike/services detail</div>
            )}
          </div>

          {/* Metadata */}
          <div className="text-xs text-gray-400 mt-3 space-y-0.5">
            {appt.createdAt && (
              <div>Created: {formatDate(appt.createdAt)}</div>
            )}
            {appt.updatedAt && (
              <div>Updated: {formatDate(appt.updatedAt)}</div>
            )}
          </div>
        </div>
          <button
            className="ml-auto px-3 py-1 rounded bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 mr-4"
            disabled={updating || appt.status === "Confirmed"}
            onClick={() => handleStatusUpdate("Confirmed")}
          >
            Confirmed
          </button>
          <button
            className="ml-auto px-3 py-1 rounded bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 mr-4"
            disabled={updating || appt.status === "Completed"}
            onClick={() => handleStatusUpdate("Completed")}
          >
            Completed
          </button>
          <button
            className="ml-auto px-3 py-1 rounded bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
            disabled={updating || appt.status === "Cancelled"}
            onClick={() => handleStatusUpdate("Cancelled")}
          >
            Cancelled
          </button>
      </div>
    </div>
  );
}
