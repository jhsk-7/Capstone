"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import axios from "axios";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    { href: "/myBikes", label: "Bikes" },
    { href: "/appointment/myAppointments", label: "Appointments" },
  ];

  // --- Settings dropdown state ---
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const btnRef = useRef(null);

  useEffect(() => {
    function onDocClick(e) {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target) &&
        btnRef.current &&
        !btnRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    }
    function onEsc(e) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", onDocClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("pointerdown", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, []);

  const [isDark, setIsDark] = useState(false);
  useEffect(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem("theme") : null;
    const prefersDark =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;

    const enableDark = stored === "dark" || (!stored && prefersDark);
    setIsDark(enableDark);
    document.documentElement.classList.toggle("dark", enableDark);
  }, []);

  const toggleDark = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  // --- Logout ---
  const handleLogout = async () => {
    try {
      await axios.get("/api/users/logout", { withCredentials: true });
      router.push("/login");
    } catch (err) {
      console.error(err);
      alert("Failed to log out. Please try again.");
    }
  };

  return (
    <nav className="bg-blue-600 text-white shadow-md">
      <div className="max-w-6xl mx-auto px-4">
        <div className="relative flex justify-between items-center h-16">
          <div className="text-xl font-bold">BikeShop</div>

          <div className="flex items-center space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`hover:text-gray-200 ${
                  pathname === item.href ? "underline font-semibold" : ""
                }`}
              >
                {item.label}
              </Link>
            ))}

            {/* Settings button + dropdown (right side) */}
            <div className="relative">
              <button
                ref={btnRef}
                onClick={() => setOpen((o) => !o)}
                aria-haspopup="menu"
                aria-expanded={open}
                aria-label="Open settings"
                className="p-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-white/60"
              >
                {/* Settings wheel image*/}
                <img
                  src="/settings-tool-svgrepo-com.svg"
                  alt="Settings"
                  className="h-6 w-6 filter invert" /* makes typical black SVG appear white */
                />
              </button>

              {open && (
                <div
                  ref={menuRef}
                  role="menu"
                  className="absolute right-0 mt-2 w-56 rounded-lg bg-white text-gray-900 shadow-lg p-2 z-50"
                >
                  {/* Dark mode toggle */}
                  <div className="flex items-center justify-between px-2 py-2 rounded hover:bg-gray-100">
                    <span className="text-sm">Dark mode</span>
                    <button
                      role="switch"
                      aria-checked={isDark}
                      onClick={toggleDark}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                        isDark ? "bg-blue-600" : "bg-gray-300"
                      }`}
                    >
                      <span
                        className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${
                          isDark ? "translate-x-5" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>

                  <div className="my-2 h-px bg-gray-200" />

                  {/* Logout */}
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-2 py-2 text-sm rounded hover:bg-gray-100"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
