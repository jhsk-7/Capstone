"use client";

import NavbarAdmin from "./NavbarAdmin";
import NavbarUser from "./NavbarUser";
import NavbarOut from "./NavbarOut"
import { useAppContext } from "@/app/appContext";

export default function Navbar() {
    const { isLoggedIn, isAdminLoggedIn, isDarkMode } = useAppContext(); 
    
  return (
    <>
      {isAdminLoggedIn ? (
        <NavbarAdmin />
      ) : isLoggedIn ? (
        <NavbarUser />
      ) : <NavbarOut />}
    </>
  );
}