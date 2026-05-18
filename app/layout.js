'use client'; // 👈 WAJIB di baris paling atas agar onMouseEnter & usePathname bisa berjalan

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Geist, Geist_Mono } from "next/font/google";
import "@/app/globals.css"; // 👈 DIPERBAIKI: Menggunakan path absolut agar Tailwind ter-load dengan aman!

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({ children }) {
  const pathname = usePathname(); // Mengambil rute halaman aktif saat ini

  // Styling inline bawaan Anda yang telah disempurnakan dengan sistem active state
  const navStyles = {
    nav: { backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0', padding: '12px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', fontFamily: 'Arial, sans-serif' },
    brandArea: { display: 'flex', alignItems: 'center', gap: '12px' },
    logo: { width: '44px', height: '44px', objectFit: 'contain', borderRadius: '50%', border: '1px solid #f1f5f9' },
    brandTextTitle: { fontWeight: '900', fontSize: '16px', color: '#0f172a', letterSpacing: '-0.5px', margin: 0, display: 'block', lineHeight: '1.2' },
    brandTextSub: { fontSize: '11px', fontWeight: 'bold', color: '#ef4444', letterSpacing: '1px', margin: 0, display: 'block' },
    linksArea: { display: 'flex', gap: '8px', backgroundColor: '#f1f5f9', padding: '4px', borderRadius: '8px' },
    
    // Style tombol saat tidak aktif
    linkBtn: { padding: '8px 14px', borderRadius: '6px', fontSize: '13px', fontWeight: 'bold', textDecoration: 'none', color: '#64748b', transition: 'all 0.2s' },
    // Style tombol saat aktif sesuai halaman yang dibuka
    linkBtnActive: { padding: '8px 14px', borderRadius: '6px', fontSize: '13px', fontWeight: 'bold', textDecoration: 'none', backgroundColor: '#ffffff', color: '#2563eb', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', transition: 'all 0.2s' }
  };

  return (
    <html lang="id" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body style={{ margin: 0, padding: 0, backgroundColor: '#f3f4f9', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        
        {/* NAVBAR TERPUSAT */}
        <nav style={navStyles.nav} className="print:hidden">
          
          {/* SISI KIRI: LOGO BULAT RESMI & TEKS */}
          <div style={navStyles.brandArea}>
            <img 
              src="/logo.png" 
              alt="Logo IndoRamen" 
              style={navStyles.logo}
            />
            <div>
              <span style={navStyles.brandTextTitle}>INDORAMEN</span>
              <span style={navStyles.brandTextSub}>PNM KITCHEN</span>
            </div>
          </div>
          
          {/* SISI KANAN: TOMBOL NAVIGASI UTAMA */}
          <div style={navStyles.linksArea}>
            <Link 
              href="/" 
              style={pathname === '/' ? navStyles.linkBtnActive : navStyles.linkBtn}
              onMouseEnter={(e) => { if(pathname !== '/') e.target.style.color = '#2563eb' }}
              onMouseLeave={(e) => { if(pathname !== '/') e.target.style.color = '#64748b' }}
            >
              🛒 Layar Kasir
            </Link>
            
            <Link 
              href="/admin/menu" 
              style={pathname === '/admin/menu' ? navStyles.linkBtnActive : navStyles.linkBtn}
              onMouseEnter={(e) => { if(pathname !== '/admin/menu') e.target.style.color = '#2563eb' }}
              onMouseLeave={(e) => { if(pathname !== '/admin/menu') e.target.style.color = '#64748b' }}
            >
              📦 Kelola Menu
            </Link>
            
            <Link 
              href="/admin/transactions" 
              style={pathname === '/admin/transactions' ? navStyles.linkBtnActive : navStyles.linkBtn}
              onMouseEnter={(e) => { if(pathname !== '/admin/transactions') e.target.style.color = '#2563eb' }}
              onMouseLeave={(e) => { if(pathname !== '/admin/transactions') e.target.style.color = '#64748b' }}
            >
              📊 Laporan Penjualan
            </Link>
          </div>

        </nav>

        {/* AREA KONTEN HALAMAN */}
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {children}
        </main>

      </body>
    </html>
  );
}