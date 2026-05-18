import { Geist, Geist_Mono } from "next/font/google";
import "@/app/globals.css"; // 👈 CSS global wajib dipanggil di sini saja
import Navbar from "./Navbar"; // 👈 Memanggil Navbar terpisah

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "IndoRamen - POS System",
  description: "Aplikasi kasir pintar IndoRamen PNM Kitchen",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body style={{ margin: 0, padding: 0, backgroundColor: '#f3f4f9', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {children}
        </main>
      </body>
    </html>
  );
}