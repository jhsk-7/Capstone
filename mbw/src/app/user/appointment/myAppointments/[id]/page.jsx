"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { normalizeError } from "@/helpers/newErrorHandler";
import { useAppContext } from "@/app/appContext";

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
  const { isDarkMode } = useAppContext();   
  const { id } = useParams();
  const [appt, setAppt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    const fetchOne = async () => {
      try {
        const res = await axios.get(`/api/users/appointment/${id}`, {
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

  const dateLabel = appt?.date ? formatDate(appt.date) : "";

  // --- Loading skeleton ---
  if (loading) {
    return (
    <div className={`min-h-[calc(100vh-4rem)] p-6 ${isDarkMode ? null : "bg-white"}`}>     
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
    </div>
    );
  }

  // --- Error state ---
  if (error) {
    return (
      <div className={`min-h-[calc(100vh-4rem)] p-6 ${isDarkMode ? null : "bg-white"}`}>
      <div className="p-6 max-w-xl mx-auto">
        <div className="fixed left-4 top-24 z-40">
          <Link
            href="/user/appointment/myAppointments"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 shadow"
          >
            Back to My Appointments
          </Link>
        </div>
        <div>
          <h1 className="text-2xl font-bold">Appointment</h1>
        </div>
        <div className="p-4 border border-red-300 bg-red-50 rounded text-red-700">
          {error}
        </div>
      </div>
      </div>
    );
  }

  if (!appt) {
    return (
    <div className={`min-h-[calc(100vh-4rem)] p-6 ${isDarkMode ? null : "bg-white"}`}>
    <div className="p-6 max-w-xl mx-auto">
      <div className="fixed left-4 top-24 z-40">
          <h1 className="text-2xl font-bold">Appointment</h1>
          <Link
            href="/user/appointment/myAppointments"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 shadow"
          >
            Back to My Appointments
          </Link>
        </div>
        <div className="text-gray-600">Appointment not found.</div>
      </div>
      </div>
    );
  }



  return (
  <div className={`min-h-[calc(100vh-4rem)] p-6 ${isDarkMode ? "" : "bg-white"}`}>
    <div className="p-6 max-w-xl mx-auto">
      <div className="fixed left-4 top-24 z-40">
        <Link
          href="/user/appointment/myAppointments"
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 shadow"
          aria-label="Go to My Appointments"
        >
          Back to My Appointments
        </Link>
      </div>

      <h1 className={`text-2xl font-bold mb-4 ${isDarkMode ? "" : "text-gray-900"}`}>
        Appointment
      </h1>
      <p className={`${isDarkMode ? "" : "text-gray-900"} mb-4`}>
        Details for this service appointment.
      </p>

      {/* Date header above details box (matches list page style) */}
      <h2 className={`text-sm font-semibold mb-2 ${isDarkMode ? "" : "text-gray-900"}`}>
        {dateLabel}
      </h2>

      <div className="border rounded border-gray-900 space-y-3">
        <div className="border p-4 rounded">
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-blue-100 text-blue-700">
              {appt.status || "Pending"}
            </span>
          </div>

          {/* Bikes & Services */}
          <div className={`${isDarkMode ? "" : "text-gray-900"} space-y-1`}>
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
                    <span className="font-medium">Services:</span> {serviceNames || "—"}
                  </div>
                );
              })
            ) : (
              <div>No bike/services detail</div>
            )}
          </div>
        </div>
      </div>
    </div>
  </div>
);
}
