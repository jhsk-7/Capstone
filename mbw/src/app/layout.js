// /src/app/layout.js
import "./globals.css";
import Navbar from "@/app/components/Navbar";
import { AppProvider } from "./appContext";


export const metadata = {
  title: "Easy Bike Service",
  description: "Premier mobile bike cleaning",
};

export default function RootLayout({ children }) {
  return (
      <html lang="en">
        <body>
          <AppProvider>
            <Navbar />
            <main>{children}</main>
          </AppProvider>
        </body>
        
      </html>
  );
}