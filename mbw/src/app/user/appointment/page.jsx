"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import axios from "axios";
import { useAppContext } from "@/app/appContext";

export default function AppointmentPage() {
  const { setNavContext, isDarkMode } = useAppContext();   
  const [userId, setUserId] = useState("");
  const [bikes, setBikes] = useState([]);
  const [services, setServices] = useState([]); // [{ _id, name, ... }]
  const [selectedBikes, setSelectedBikes] = useState([]); // [{ bikeId, services: [serviceId] }]
  const [date, setDate] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // prevent past dates
  const todayStr = useMemo(() => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }, []);

  useEffect(() => {
    const fetchUserAndBikes = async () => {
      try {
        // User
        const userRes = await axios.get("/api/users/userAuth/validUser", { withCredentials: true });
        const user = userRes.data.data;
        setUserId(user._id);

        // Bikes
        const bikesRes = await axios.get("/api/users/bikes/myBikes", { withCredentials: true });
        setBikes(bikesRes.data.data || []);

        // Services
        const servicesRes = await axios.get("/api/users/services", { withCredentials: true });
        setServices(servicesRes.data.data || []);

        setNavContext('userIn');
      } catch (err) {
        const findStatus = async () => {
          const { status, message} = normalizeError(err);
          setErrMsg(message);
        };
        await findStatus();
      }
    };
    fetchUserAndBikes();
  }, []);

  const toggleBike = (bikeId) => {
    setSelectedBikes((prev) =>
      prev.some((b) => b.bikeId === bikeId)
        ? prev.filter((b) => b.bikeId !== bikeId)
        : [...prev, { bikeId, services: [] }]
    );
  };

  // serviceId should be a string
  const toggleService = (bikeId, serviceId) => {
    const id = String(serviceId);
    setSelectedBikes((prev) =>
      prev.map((b) =>
        b.bikeId === bikeId
          ? {
              ...b,
              services: b.services.includes(id)
                ? b.services.filter((s) => s !== id)
                : [...b.services, id],
            }
          : b
      )
    );
  };

  const handleSubmit = async () => {
    try {
      if (!userId) return alert("You must be logged in.");
      if (!date) return alert("Please choose a date.");
      if (selectedBikes.length === 0) return alert("Select at least one bike.");

      setSubmitting(true);

      const bikesPayload = selectedBikes.map((b) => ({
        bikeId: b.bikeId,
        services: Array.from(new Set((b.services || []).map(String))), // can be []
      }));

      const payload = { userId, date, bikes: bikesPayload };

      await axios.post("/api/users/appointment", payload, { withCredentials: true });

      alert("Appointment booked successfully!");
      setSelectedBikes([]);
      setDate("");
    } catch (err) {
      const findStatus = async () => {
        const { status, message} = normalizeError(err);
        setErrMsg(message);
      };
      await findStatus();

    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className={`min-h-[calc(100vh-4rem)] p-6 ${isDarkMode ? "" : "bg-white"}`}>
        <div className="fixed left-4 top-24 z-40 hide-on-small">
          <Link
            href="/user/appointment/myAppointments"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 shadow"
            aria-label="Go to My Appointments"
          >
            My Appointments
          </Link>
        </div>

        <div className="p-6 max-w-xl mx-auto">
          {/* in-flow link that appears above the H1 on small screens (<1000px) */}
          <div className="show-on-small mb-4" style={{display: 'none'}}>
            <Link
              href="/user/appointment/myAppointments"
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 shadow"
              aria-label="Go to My Appointments"
            >
              My Appointments
            </Link>
          </div>

          <h1 className={`text-2xl font-bold mb-4 ${isDarkMode? "" : "text-gray-900"}`}>Book a Service Appointment</h1>

        <label className={`block mb-2 ${isDarkMode? null : "text-gray-900"}`}>Select Date:</label>
        <input
          type="date"
          className="border border-gray-900 p-2 w-full mb-4 rounded"
          value={date}
          min={todayStr}
          onChange={(e) => setDate(e.target.value)}
        />

        <h2 className={`text-lg mb-2 ${isDarkMode? null : "text-gray-900"}`}>Select Bikes & Services</h2>
        <div className="space-y-4">
          {bikes.map((bike) => {
            const selectedBike = selectedBikes.find((b) => b.bikeId === bike._id);
            return (
              <div key={bike._id} className="border border-gray-900 p-4 rounded">
                <label className={`flex items-center space-x-2 mb-2 ${isDarkMode? null : "text-gray-900"}`}>
                  <input
                    type="checkbox"
                    checked={!!selectedBike}
                    onChange={() => toggleBike(bike._id)}
                  />
                  <span>
                    {bike.nickname}, {(bike.brand || bike.make)} {bike.model}
                  </span>
                </label>

                {selectedBike && (
                  <div className="ml-6">
                    {services.length === 0 ? (
                      <p className="text-sm text-gray-500">No services available.</p>
                    ) : (
                      services.map((service) => {
                        const sid = String(service._id);
                        const checked = selectedBike.services.includes(sid);
                        return (
                          <label key={sid} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleService(bike._id, sid)}
                            />
                            <span>
                              {service.name}
                              {service.price != null && (
                                <span className="text-gray-200/90 ml-1">
                                  • ${Number(service.price).toFixed(2)}
                                </span>
                              )}
                            </span>
                          </label>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <button
          className="bg-blue-600 text-white px-4 py-2 rounded mt-6 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleSubmit}
          disabled={submitting || !date || selectedBikes.length === 0}
        >
          {submitting ? "Booking..." : "Book Appointment"}
        </button>
        </div>
      </div>

      <style jsx>{`
        .hide-on-small { display: block; }
        .show-on-small { display: none; }

        @media (max-width: 999px) {
          .hide-on-small { display: none !important; }
          .show-on-small { display: block !important; }
        }

        @media (min-width: 1000px) {
          .hide-on-small { display: block !important; }
          .show-on-small { display: none !important; }
        }
      `}</style>
    </>
  );
}