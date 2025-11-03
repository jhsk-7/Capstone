"use client"

import { useEffect } from "react";
import { useAppContext } from "@/app/appContext";

export default function HomePage() {
  const { setNavContext, isDarkMode } = useAppContext();

  useEffect(() => {
    setNavContext('home');
  }, []);

  return (
  <div className={`min-h-[calc(100vh-4rem)] p-6 ${isDarkMode ? null : "bg-white"}`}>
    <div className="p-6 max-w-xl mx-auto">
      <h1 className={`text-3xl text-center font-semibold italic mb-4 ${isDarkMode? null : "text-gray-900"}`}>Hello two-wheele lovers!</h1>
      <p className={`mb-4 text-center ${isDarkMode ? null : "text-gray-900"}`}>
        Whether you're a casual cruiser, dirt lover or a seasoned road warrior, we're here to help you stay on your bike and enjoy more time doing what you love.
      </p>
      <br/>
      <p className="text-6xl text-center">🌇⛰️🚴🌞</p>    
      <br/>
      <p className={`mb-4 text-center ${isDarkMode ? null : "text-gray-900"}`}>
        Ready to enhance your biking experience? 
      </p>    
      <br/>
      <p className="text-6xl text-center">💪❤️🤟</p>    
      <br/>
      <p className={`mb-4 text-center ${isDarkMode ? null : "text-gray-900"}`}>
        Signup today to access our full range of services!
      </p>
      <br/>
      <p className="text-6xl text-center">😜</p>    
      <br/>
    </div>
  </div>
  );
}