import "./globals.css";
import Navbar from "@/app/components/Navbar";


export const metadata = {
  title: "Clean Bike Express",
  description: "Premier mobile bike cleaning",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
          <Navbar />
          <main className="p-6">{children}</main>
      </body>
    </html>
  );
}