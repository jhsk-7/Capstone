"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function AdminLogin() {
  const router = useRouter();

  const [form, setForm] = useState({
    emailOrUsername: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [buttonDisabled, setButtonDisabled] = useState(true);

  useEffect(() => {
    setButtonDisabled(!(form.emailOrUsername && form.password));
  }, [form]);

  const handleLogin = async () => {
    try {
      setLoading(true);
      const res = await axios.post("/api/admin/login", form, {
        withCredentials: true,
      });
      alert(res.data.message);
      router.push("/admin/services"); 
    } catch (err) {
      console.error("Admin login failed:", err.response?.data || err.message);
      alert(err.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-6">
      <h1 className="text-2xl font-bold mb-4">
        {loading ? "Logging in..." : "Admin Login"}
      </h1>
      <input
        className="border p-2 w-64 mb-2 rounded"
        placeholder="Email or Username"
        value={form.emailOrUsername}
        onChange={(e) =>
          setForm({ ...form, emailOrUsername: e.target.value })
        }
      />
      <input
        type="password"
        className="border p-2 w-64 mb-2 rounded"
        placeholder="Password"
        value={form.password}
        onChange={(e) =>
          setForm({ ...form, password: e.target.value })
        }
      />
      <button
        className={`px-4 py-2 rounded text-white ${
          buttonDisabled
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700"
        }`}
        onClick={handleLogin}
        disabled={buttonDisabled || loading}
      >
        {buttonDisabled ? "Enter Credentials" : "Login"}
      </button>
    </div>
  );
}