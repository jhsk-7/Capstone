"use client";

import NavbarAdmin from "./NavbarAdmin";
import NavbarUser from "./NavbarUser";
import NavbarOut from "./NavbarOut"
import NavbarHome from "./NavbarHome"
import { useAppContext } from "@/app/appContext";

export default function Navbar() {
    const { isLoggedIn, isAdminLoggedIn, isHome, isDarkMode } = useAppContext(); 
    
  return (
    <>
      {isAdminLoggedIn ? (
        <NavbarAdmin />
      ) : isLoggedIn ? (
        <NavbarUser />
      ) : isHome?
        <NavbarHome /> : 
      <NavbarOut />}
    </>
  );
}