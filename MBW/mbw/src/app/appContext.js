// /src/app/appContext.js
"use client";

import { createContext, useContext, useState } from "react";

const AppContext = createContext(null);
export default AppContext; 

export function AppProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true)
  const value = { isLoggedIn, setIsLoggedIn, isDarkMode, setIsDarkMode };
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within <AppProvider>");
  return ctx;
}
