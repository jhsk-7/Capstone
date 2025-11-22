"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useAppContext } from "@/app/appContext";
import { normalizeError} from "@/helpers/newErrorHandler";

export default function AdminSignup() {
  const { setNavContext, isDarkMode } = useAppContext();   
  const router = useRouter();
  const [user, setUser] = useState({ email: "", username: "", password: "", secretCode: "" });
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState("");

  const isDisabled = loading || !user.email || !user.username || !user.password || !user.secretCode;

  useEffect(() => {
    setNavContext('signup');
  },[]);

  const onSignup = async (e) => {
    e?.preventDefault();
    if (isDisabled) return;

    try {
      setErrMsg("");
      setLoading(true);
      const res = await axios.post("/api/admin/adminAuth/signup", user, { withCredentials: true });
      router.push("/admin/auth/login");
    } catch (error) {
      const findStatus = async () => {
        const { status, message} = normalizeError(error);
        setErrMsg(message);
      };
      await findStatus();
      console.log(error)
    } finally {
      setLoading(false);
    }
  };


return (
    <div className={`min-h-[calc(100vh-4rem)] p-6 ${isDarkMode ? null : "bg-white"}`}>
    <div className="p-6 max-w-xl mx-auto">
      <h1 className={`text-2xl font-bold mb-4 ${isDarkMode? null : "text-gray-900"}`}>Sign up</h1>

      {errMsg && (
        <div className="mb-4 p-4 border border-red-300 bg-red-50 rounded text-red-700">
          {errMsg}
        </div>
      )}

      <form onSubmit={onSignup} className="space-y-4">
        <div>
          <label htmlFor="username" className={`block mb-2 ${isDarkMode ? null : "text-gray-900"}`}>
            Username
          </label>
          <input
            id="username"
            type="text"
            value={user.username}
            onChange={(e) => setUser((u) => ({ ...u, username: e.target.value }))}
            placeholder="yourname"
            className={`border p-2 w-full rounded placeholder:text-shadow-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode ? null : "text-gray-900"}`}
            required
            autoComplete="username"
          />
        </div>

        <div>
          <label htmlFor="email" className={`block mb-2 ${isDarkMode ? null : "text-gray-900"}`}>
            Email
          </label>
          <input
            id="email"
            type="email"
            value={user.email}
            onChange={(e) => setUser((u) => ({ ...u, email: e.target.value }))}
            placeholder="you@example.com"
            className={`border p-2 w-full rounded placeholder:text-shadow-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode ? null : "text-gray-900"}`}
            required
            autoComplete="email"
          />
        </div>

        <div>
          <label htmlFor="password" className={`block mb-2 ${isDarkMode ? null : "text-gray-900"}`}>
            Password
          </label>
          <input
            id="password"
            type="password"
            value={user.password}
            onChange={(e) => setUser((u) => ({ ...u, password: e.target.value }))}
            placeholder="••••••••"
            className={`border p-2 w-full rounded placeholder:text-shadow-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode ? null : "text-gray-900"}`}
            required
            autoComplete="new-password"
          />
        </div>

        <div>
          <label htmlFor="secretCode" className={`block mb-2 ${isDarkMode ? null : "text-gray-900"}`}>
            Secret Code
          </label>
          <input
            id="secretCode"
            type="password"
            value={user.secretCode}
            onChange={(e) => setUser((u) => ({ ...u, secretCode: e.target.value }))}
            placeholder="Secret Code"
            className={`border p-2 w-full rounded placeholder:text-shadow-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode ? null : "text-black"}`}
            required
          />
        </div>

        <button
          type="submit"
          disabled={isDisabled}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Creating account…" : "Sign up"}
        </button>
      </form>

      <div className="mt-4">
        <span className={`mr-2 ${isDarkMode? null : "text-gray-900"}`}>Already have an account?</span>
        <Link href="/admin/auth/login" className="text-blue-600  hover:underline">
          Log in
        </Link>
      </div>
    </div>
    </div>
  );
}