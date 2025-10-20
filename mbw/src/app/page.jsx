"use client"

import { useEffect } from "react";
import { useAppContext } from "@/app/appContext";

export default function HomePage() {
  const { setIsHome } = useAppContext();

  useEffect(() => {
    setIsHome(true);
  }, []);

  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Welcome</h1>
      <p className="mb-4 text-gray-600">
        Hello bike lovers! 
      </p>
    </main>
  );
}