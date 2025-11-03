// /src/app/user/auth/login
"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { normalizeError} from "@/helpers/newErrorHandler";
import { useAppContext } from "@/app/appContext";

export default function LoginPage() {
  const router = useRouter();

  const { setIsLoggedIn, isDarkMode, setNavContext } = useAppContext(); 
  const [user, setUser] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState("");

  const isDisabled = loading || !user.email || !user.password;

  useEffect(() => {
    setNavContext('login')
  }, []);

  const onLogin = async (e) => {
    e?.preventDefault();
    if (isDisabled) return;

    try {
      setErrMsg("");
      setLoading(true);
      const res = await axios.post("/api/users/userAuth/login", user, { withCredentials: true });
      setIsLoggedIn(true)
      router.push("/user/myBikes");
    } catch (err) {
      const findStatus = async () => {
        const { message} = normalizeError(err);
        setErrMsg(message);
      };
      await findStatus();

    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className={`min-h-[calc(100vh-4rem)] p-6 ${isDarkMode ? null : "bg-white"}`}>
    <div className="p-6 max-w-xl mx-auto">
      <h1 className={`text-2xl font-bold mb-4 ${isDarkMode ? null : "text-black"}`}>Log in</h1>

      {errMsg && (
        <div className="mb-4 p-4 border border-red-300 bg-red-50 rounded text-red-700">
          {errMsg}
        </div>
      )}

      <form onSubmit={onLogin} className="space-y-4">
        <div>
          <label htmlFor="email" className={`block mb-2 ${isDarkMode ? null : "text-black"}`}>
            Email
          </label>
          <input
            id="email"
            type="email"
            value={user.email}
            onChange={(e) => setUser((u) => ({ ...u, email: e.target.value }))}
            placeholder="you@example.com"
            className={`border p-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode ? "placeholder:text-shadow-white" : "text-black"}`}
            required
            autoComplete="email"
          />
        </div>

        <div>
          <label htmlFor="password" className={`block mb-2 ${isDarkMode ? null : "text-black"}`}>
            Password
          </label>
          <input
            id="password"
            type="password"
            value={user.password}
            onChange={(e) => setUser((u) => ({ ...u, password: e.target.value }))}
            placeholder="••••••••"
            className={`border p-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode ? "placeholder:text-shadow-white" : "text-black"}`}
            required
            autoComplete="current-password"
          />
        </div>

        <button
          type="submit"
          disabled={isDisabled}
          className="bg-blue-600  px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white"
        >
          {loading ? "Signing in…" : "Login"}
        </button>
      </form>

      <div className={`mt-4 text-sm ${isDarkMode ? null : "text-black"}`}>
        <span className="mr-2">Don’t have an account?</span>
        <Link href="/user/auth/signup" className="text-blue-600 hover:underline">
          Sign up
        </Link>
      </div>
    </div>
    </div>
  );
}
