"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function AdminServicesPage() {
  const [services, setServices] = useState([]);
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    durationMinutes: "",
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const load = async () => {
    const res = await axios.get("/api/admin/services", { withCredentials: true });
    setServices(res.data.data || []);
  };

  useEffect(() => {
    load();
  }, []);

  const createService = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(
        "/api/admin/services",
        {
          ...form,
          price: Number(form.price),
          durationMinutes: Number(form.durationMinutes),
        },
        { withCredentials: true }
      );
      setForm({ name: "", description: "", price: "", durationMinutes: "" });
      await load();
    } catch (e) {
      alert(e.response?.data?.error || "Failed to create service");
    } finally {
      setLoading(false);
    }
  };

  const updateService = async (id, updates) => {
    await axios.patch(`/api/admin/services/${id}`, updates, { withCredentials: true });
    await load();
  };

  const deleteService = async (id) => {
    if (!confirm("Delete this service?")) return;
    await axios.delete(`/api/admin/services/${id}`, { withCredentials: true });
    await load();
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Admin — Services</h1>
      </div>

      <form
        onSubmit={createService}
        className="grid grid-cols-1 gap-3 md:grid-cols-2 border p-4 rounded mb-6"
      >
        <input
          className="border p-2 rounded"
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          required
        />
        <input
          className="border p-2 rounded"
          placeholder="Price"
          type="number"
          min="0"
          step="0.01"
          value={form.price}
          onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
          required
        />
        <input
          className="border p-2 rounded"
          placeholder="Duration (minutes)"
          type="number"
          min="0"
          value={form.durationMinutes}
          onChange={(e) =>
            setForm((f) => ({ ...f, durationMinutes: e.target.value }))
          }
          required
        />
        <input
          className="border p-2 rounded md:col-span-2"
          placeholder="Description"
          value={form.description}
          onChange={(e) =>
            setForm((f) => ({ ...f, description: e.target.value }))
          }
        />
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded md:col-span-2"
          disabled={loading}
        >
          {loading ? "Creating..." : "Create Service"}
        </button>
      </form>

      <div className="space-y-3">
        {services.map((s) => (
          <div
            key={s._id}
            className="border p-4 rounded flex items-start justify-between gap-4"
          >
            <div>
              <div className="font-semibold">{s.name}</div>
              <div className="text-sm text-gray-600">{s.description}</div>
              <div className="text-sm mt-1">
                ${s.price.toFixed(2)} • {s.durationMinutes} min
              </div>
              <div className="text-xs mt-1">
                Active: {s.active ? "Yes" : "No"}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                className="px-3 py-1 border rounded"
                onClick={() => updateService(s._id, { active: !s.active })}
              >
                {s.active ? "Deactivate" : "Activate"}
              </button>
              <button
                className="px-3 py-1 border rounded"
                onClick={() => {
                  const name = prompt("New name", s.name);
                  if (name) updateService(s._id, { name });
                }}
              >
                Rename
              </button>
              <button
                className="px-3 py-1 border rounded"
                onClick={() => deleteService(s._id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
        {services.length === 0 && (
          <p className="text-gray-500">No services yet.</p>
        )}
      </div>
    </div>
  );
}