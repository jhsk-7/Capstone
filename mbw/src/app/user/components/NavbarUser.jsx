"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useAppContext } from "@/app/appContext";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { isLoggedIn, setIsLoggedIn, isDarkMode, setIsDarkMode } = useAppContext(); 

  const navItems = [
    { href: "/user/myBikes", label: "Bikes" },
    { href: "/user/appointment/myAppointments", label: "Appointments" },
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

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem("theme");
    const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches;
    const enableDark = stored ? stored === "dark" : !!prefersDark;

    setIsDarkMode(enableDark); // <-- fixed typo
    document.documentElement.classList.toggle("dark", enableDark);
  }, [setIsDarkMode]);


  const toggleDark = () => {
    const next = !isDarkMode;
    setIsDarkMode(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  // --- Logout ---
  const handleLogout = async () => {
    try {
      await axios.get("/api/users/userAuth/logout", { withCredentials: true });
      setIsLoggedIn(false)
      router.push("/user/auth/login");
    } catch (err) {
      console.error(err);
      alert("Failed to log out. Please try again.");
    }
  };

  return (
    <nav className={`shadow-md ${isDarkMode ? "bg-blue-600 text-white" : "bg-white text-gray-900"}`}>
      <div className="max-w-6xl mx-auto px-4">
        <div className="relative flex justify-between items-center h-16">
          <div className="text-xl font-bold">BikeShop</div>

          <div className="flex items-center space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`${isDarkMode ? "hover:bg-blue-700" : "hover:bg-gray-200"} ${
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
                className={`p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/60 ${isDarkMode ? "hover:bg-blue-700" : "hover:bg-gray-200"}`}
              >
                {/* Settings wheel image*/}
                <img
                  src="/settings-tool-svgrepo-com.svg"
                  alt="Settings"
                  className={`h-6 w-6 ${isDarkMode ? "filter invert" : "filter-none"}`} /* makes typical black SVG appear white */
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
                      aria-checked={isDarkMode}
                      onClick={toggleDark}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                        isDarkMode ? "bg-blue-600" : "bg-gray-300"
                      }`}
                    >
                      <span
                        className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${
                          isDarkMode ? "translate-x-5" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>

                  <div className="my-2 h-px bg-gray-200" />

                  {/* Logout */}
                  {isLoggedIn === true && (
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-2 py-2 text-sm rounded hover:bg-gray-100"
                    >
                      Logout
                    </button> 
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
