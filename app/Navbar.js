import { Geist, Geist_Mono } from "next/font/google";
import "@/app/globals.css"; // 👈 CSS global dijamin akan ter-load sempurna karena dijalankan di server side
import Navbar from "./Navbar"; // 👈 Memanggil komponen Navbar buatan kita

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Anda juga bisa menambahkan metadata resmi di sini sekarang agar SEO/aplikasi lebih bagus
export const metadata = {
  title: "IndoRamen - POS System",
  description: "Aplikasi kasir pintar IndoRamen PNM Kitchen",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body style={{ margin: 0, padding: 0, backgroundColor: '#f3f4f9', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        
        {/* Panggil navbar eksternal di sini */}
        <Navbar />

        {/* AREA KONTEN HALAMAN */}
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {children}
        </main>

      </body>
    </html>
  );
}