"use client";

import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation"; 
import { useAppContext } from "@/app/appContext";
import { normalizeError } from "@/helpers/newErrorHandler";


function formatDate(d) {
  try {
    return new Date(d).toLocaleString([], {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return d;
  }
}

export default function MyAppointmentsPage() {
  const { setNavContext, isDarkMode } = useAppContext(); 
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter(); 

  const fetchAppointments = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get("/api/admin/appointments", {
        withCredentials: true,
      });
      setAppointments(res.data.appointments || []);
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

  useEffect(() => {
    fetchAppointments();
    setNavContext('adminIn');
  }, []);

  const grouped = useMemo(() => {
    const map = new Map();
    for (const a of appointments) {
      const key = new Date(a.date).toDateString();
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(a);
    }
    return map;
  }, [appointments]);

  return (
    <div className={`min-h-[calc(100vh-4rem)] p-6 ${isDarkMode ? null : "bg-white"}`}>
      <div className="p-6 max-w-xl mx-auto">
        <h1 className={`text-2xl font-bold mb-4 ${isDarkMode? null : "text-gray-900"}`}>Appointments</h1>
        <p className={`mb-4 ${isDarkMode? null : "text-gray-900"}`}>
          View all of your upcoming client appointments.
        </p>

        {error && (
          <div className="mb-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className={`${isDarkMode? null : "text-gray-900"}`}>Loading appointments…</div>
        ) : appointments.length === 0 ? (
          <div className={`${isDarkMode? null : "text-gray-900"}`}>No appointments yet.</div>
        ) : (
          Array.from(grouped.entries()).map(([day, items]) => (
            <div key={day} className="mb-6">
              <h2 className={`text-sm font-semibold mb-2 ${isDarkMode? null : "text-gray-900"}`}>{day}</h2>
              <div className="space-y-3">
                {items.map((a, idx) => {
                  // handle string ids and {$oid: "..."}
                  const id =
                    typeof a._id === "string" ? a._id : a?._id?.$oid ?? "";

                  const go = () => id && router.push(`./appointments/${id}`); 

                  return (
                    <div
                      key={id || idx}
                      role="button"
                      tabIndex={0}
                      onClick={go}
                      className={`border p-4 rounded cursor-pointer hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500  ${isDarkMode? null : "text-gray-900"}`}
                      aria-label={`Open appointment on ${formatDate(a.date)}`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-blue-100 text-blue-700">
                          {a.status}
                        </span>
                      </div>

                      {/* Bikes & Services */}
                      <div className={`text-sm space-y-1 ${isDarkMode? null : "text-gray-900"}`}>
                        {Array.isArray(a.bikes) && a.bikes.length > 0 ? (
                          a.bikes.map((b, i) => {
                            const bikeLabel =
                              b?.bikeId?.nickname ||
                              b?.bikeId?.model ||
                              (typeof b?.bikeId === "string" ? b.bikeId : b?.bikeId?._id) ||
                              "—";

                            const servicesList =
                              Array.isArray(b.services) && b.services.length
                                ? b.services
                                    .map((s) =>
                                      typeof s === "string" ? s : s?.name ?? s?._id
                                    )
                                    .join(", ")
                                : "—";

                            return (
                              <div key={b?.bikeId?._id || b?.bikeId || i}>
                                {i === 0 && a.userId && (
                                  <div className="mb-1 font-semibold text-sm">
                                    User: {a.userId.username || "Unknown"}
                                  </div>
                                )}
                                <span className="font-medium">Bike:</span> {bikeLabel}
                                <span className="text-gray-300 mx-2">-</span>
                                <span className="font-medium">Services:</span> {servicesList}
                              </div>
                            );
                          })
                        ) : (
                          <div>No bike/services detail</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
