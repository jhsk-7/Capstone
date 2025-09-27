"use client";

import Link from "next/link";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { normalizeError} from "@/helpers/newErrorHandler";

export default function LoginPage() {
  const router = useRouter();

  const [user, setUser] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState("");

  const isDisabled = loading || !user.email || !user.password;

  const onLogin = async (e) => {
    e?.preventDefault();
    if (isDisabled) return;

    try {
      setErrMsg("");
      setLoading(true);
      const res = await axios.post("/api/users/login", user, { withCredentials: true });
      
      router.push("/myBikes");
    } catch (err) {
      const findStatus = async () => {
        const { status, message} = normalizeError(err);
        setErrMsg(message);
      };
      await findStatus();

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Log in</h1>

      {errMsg && (
        <div className="mb-4 p-4 border border-red-300 bg-red-50 rounded text-red-700">
          {errMsg}
        </div>
      )}

      <form onSubmit={onLogin} className="space-y-4">
        <div>
          <label htmlFor="email" className="block mb-2">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={user.email}
            onChange={(e) => setUser((u) => ({ ...u, email: e.target.value }))}
            placeholder="you@example.com"
            className="border p-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            autoComplete="email"
          />
        </div>

        <div>
          <label htmlFor="password" className="block mb-2">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={user.password}
            onChange={(e) => setUser((u) => ({ ...u, password: e.target.value }))}
            placeholder="••••••••"
            className="border p-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            autoComplete="current-password"
          />
        </div>

        <button
          type="submit"
          onClick={onLogin}
          disabled={isDisabled}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Signing in…" : "Login"}
        </button>
      </form>

      <div className="mt-4 text-sm text-gray-700">
        <span className="mr-2">Don’t have an account?</span>
        <Link href="/signup" className="text-blue-600 hover:underline">
          Sign up
        </Link>
      </div>

    </div>
  );
}
