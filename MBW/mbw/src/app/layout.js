// /src/app/layout.js
import "./globals.css";
import Navbar from "@/app/user/components/NavbarUser";
import { AppProvider } from "./appContext";


export const metadata = {
  title: "Clean Bike Express",
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