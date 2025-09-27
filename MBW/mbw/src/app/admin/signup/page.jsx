"use client";
import { useState } from "react";
import axios from "axios";

export default function AdminSignup() {
  const [form, setForm] = useState({ email: "", username: "", password: "", secretCode: "" });

  const handleSignup = async () => {
    try {
      const res = await axios.post("/api/admin/signup", form);
      alert(res.data.message);
    } catch (err) {
      alert(err.response?.data?.error || "Signup failed");
    }
  };

  return (
    <div className="p-6 max-w-sm mx-auto">
      <h1 className="text-xl font-bold mb-4">Admin Signup</h1>
      <input
        className="border p-2 w-full mb-2"
        placeholder="Email"
        type="email"
        onChange={e => setForm({ ...form, email: e.target.value })}
      />
      <input
        className="border p-2 w-full mb-2"
        placeholder="Username"
        onChange={e => setForm({ ...form, username: e.target.value })}
      />
      <input
        type="password"
        className="border p-2 w-full mb-2"
        placeholder="Password"
        onChange={e => setForm({ ...form, password: e.target.value })}
      />
      <input
        className="border p-2 w-full mb-2"
        placeholder="Secret Code"
        onChange={e => setForm({ ...form, secretCode: e.target.value })}
      />
      <button
        className="bg-blue-600 text-white px-4 py-2 rounded"
        onClick={handleSignup}
      >
        Sign Up
      </button>
    </div>
  );
}