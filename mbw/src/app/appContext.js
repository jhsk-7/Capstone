// /src/app/appContext.js
"use client";

import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

const AppContext = createContext(null);
export default AppContext; 

export function AppProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [navContext, setNavContext] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [username, setUsername] = useState("");
  const value = { isLoggedIn, setIsLoggedIn, isAdminLoggedIn, setIsAdminLoggedIn, navContext, setNavContext, isDarkMode, setIsDarkMode, username, setUsername };

  useEffect(() => {
    const checkUser = async () => {
      try {
        const res = await axios.get("/api/users/userAuth/validUser", {
          withCredentials: true,
        });
        if (res.data?.authenticated) {
          setIsLoggedIn(true);
          setUsername(res.data.data.username || "");
        } else {
          setIsLoggedIn(false);
          setUsername("");
        }
      } catch (err) {
        setIsLoggedIn(false);
        setUsername("");
      }
    };
    checkUser();
  }, []);  


  useEffect(() => {
  const checkAdmin = async () => {
    try {
      const res = await axios.get("/api/admin/adminAuth/validAdmin", { withCredentials: true });

      if (res.data?.authenticated) {
        setIsAdminLoggedIn(true);
      } else {
        setIsAdminLoggedIn(false);
      }
    } catch {
      setIsAdminLoggedIn(false);
    }
  };

  checkAdmin();
}, []);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}


export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within <AppProvider>");
  return ctx;
}
