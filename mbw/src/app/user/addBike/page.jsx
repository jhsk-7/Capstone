"use client";

import AddBikeForm from "./AddBikeForm";
import Link from "next/link";
import { useAppContext } from "@/app/appContext";

export default function AddBikePage() {
  const { isDarkMode } = useAppContext(); 
  
  return (
    <>
      <div className={`min-h-[calc(100vh-4rem)] p-6 ${isDarkMode ? "" : "bg-white"}`}>
        <div className="fixed left-4 top-24 z-40 hide-on-small">
          <Link
            href="/user/myBikes"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 shadow"
            aria-label="Go to My Bikes"
          >
            My Bikes
          </Link>
        </div>

        <div className="p-6 max-w-xl mx-auto">
          {/* in-flow link that appears above the H1 on small screens (<1000px) */}
          <div className="show-on-small mb-4" style={{display: 'none'}}>
            <Link
              href="/user/myBikes"
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 shadow"
              aria-label="Go to My Bikes"
            >
              My Bikes
            </Link>
          </div>

          <h1 className={`text-2xl font-bold mb-4 ${isDarkMode? "" : "text-gray-900"}`}>Add Bike</h1>
          <p className={`mb-4 ${isDarkMode? "" : "text-gray-900"}`}>
            Fill out form to create a new bike.
          </p>

          <div className="mb-6">   
            <AddBikeForm/>
          </div>
        </div>
      </div>

      <style jsx>{`
        .hide-on-small { display: block; }
        .show-on-small { display: none; }

        /* On small screens, hide the fixed link and show the in-flow link above the H1 */
        @media (max-width: 999px) {
          .hide-on-small { display: none !important; }
          .show-on-small { display: block !important; }
        }

        /* On wide screens ensure in-flow link stays hidden */
        @media (min-width: 1000px) {
          .hide-on-small { display: block !important; }
          .show-on-small { display: none !important; }
        }
      `}</style>
    </>
  );
}
