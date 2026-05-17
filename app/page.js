'use client';
import { useState, useEffect } from 'react';

export default function LayarKasirPage() {
  const [menus, setMenus] = useState([]);
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  
  // State tambahan untuk menyimpan info struk yang sedang dicetak
  const [activeReceipt, setActiveReceipt] = useState(null);

  // --- 🟢 STATE BARU UNTUK INTEGRASI POP-UP TOPPING ---
  const [isToppingModalOpen, setIsToppingModalOpen] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState(null);
  const [daftarToppings, setDaftarToppings] = useState([]);
  const [selectedToppings, setSelectedToppings] = useState([]);

  // Ambil data menu dari API untuk ditampilkan di kasir
  useEffect(() => {
    fetch('/api/menu')
      .then((res) => res.json())
      .then((data) => {
        setMenus(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    // --- 🟢 FETCH DATA TOPPING DARI DATABASE (DENGAN PENGAMAN ARRAY) ---
    fetch('/api/topping')
      .then((res) => res.json())
      .then((data) => setDaftarToppings(Array.isArray(data) ? data : []))
      .catch((err) => {
        console.error("Gagal memuat topping:", err);
        setDaftarToppings([]); // Fallback aman ke array kosong jika API error
      });
  }, []);

  // Filter pencarian berdasarkan nama menu atau kategori
  const filteredMenus = menus.filter(menu => 
    menu.nama.toLowerCase().includes(search.toLowerCase()) ||
    menu.kategori.toLowerCase().includes(search.toLowerCase())
  );

  // --- 🟢 LOGIKA CEGAT MENU KETIKA DIKLIK ---
  const handleMenuClick = (menu) => {
    if (menu.kategori === 'Makanan') {
      setSelectedMenu(menu);
      setSelectedToppings([]); // Reset pilihan topping sebelumnya
      setIsToppingModalOpen(true); // Buka pop-up modal
    } else {
      // Jika minuman atau cemilan, langsung masuk keranjang tanpa topping
      executeAddToCart(menu, []);
    }
  };

  // --- 🟢 TOGGLE SELEKSI CHECKBOX TOPPING ---
  const handleToppingToggle = (topping) => {
    const exists = selectedToppings.find(t => t.id === topping.id);
    if (exists) {
      setSelectedToppings(selectedToppings.filter(t => t.id !== topping.id));
    } else {
      setSelectedToppings([...selectedToppings, topping]);
    }
  };

  // --- 🟢 FUNGSI UTAMA MEMASUKKAN MENU + TOURING KE KERANJANG ---
  const executeAddToCart = (menu, toppingsList = []) => {
    // Pengaman: pastikan toppingsList selalu berupa array
    const safeToppingsList = Array.isArray(toppingsList) ? toppingsList : [];

    // Membuat identifier unik untuk kombinasi menu + susunan topping tertentu
    const toppingIdsString = safeToppingsList.map(t => t.id).sort().join(',');
    const cartItemId = `${menu.id}-${toppingIdsString}`;

    // Hitung tambahan harga dari total topping yang dipilih
    const totalHargaTopping = safeToppingsList.reduce((acc, t) => acc + Number(t.harga), 0);
    const hargaFinalItem = Number(menu.harga) + totalHargaTopping;

    const existingItem = cart.find(item => item.cartItemId === cartItemId);
    
    if (existingItem) {
      setCart(cart.map(item => 
        item.cartItemId === cartItemId ? { ...item, qty: item.qty + 1 } : item
      ));
    } else {
      setCart([...cart, { 
        ...menu, 
        cartItemId, // ID Unik keranjang
        toppings: safeToppingsList, 
        hargaCustom: hargaFinalItem, // Menyimpan harga gabungan baru
        qty: 1 
      }]);
    }
  };

  // Fungsi Kurangi/Hapus dari Keranjang
  const removeFromCart = (cartItemId) => {
    const existingItem = cart.find(item => item.cartItemId === cartItemId);
    if (!existingItem) return;
    
    if (existingItem.qty === 1) {
      setCart(cart.filter(item => item.cartItemId !== cartItemId));
    } else {
      setCart(cart.map(item => 
        item.cartItemId === cartItemId ? { ...item, qty: item.qty - 1 } : item
      ));
    }
  };

  // Hitung Total Belanja (Membaca dari properti hargaCustom yang baru)
  const totalBayar = cart.reduce((acc, item) => acc + (item.hargaCustom * item.qty), 0);

  // Fungsi Simpan Transaksi (Bayar & Otomatis Cetak Struk)
  const handleCheckout = async () => {
    if (cart.length === 0) return alert("Keranjang masih kosong!");

    const konfirmasi = confirm(`Total Belanja: Rp ${totalBayar.toLocaleString('id-ID')}\nProses pembayaran transaksi sekarang?`);
    if (!konfirmasi) return;

    const currentReceiptNumber = `TRX-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${Math.floor(1000 + Math.random() * 9000)}`;
    const currentTimestamp = new Date().toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' });

    // --- 🛠️ FIX DATA MAPPING AGAR TIDAK CRASH ---
    const payload = {
      receiptNumber: currentReceiptNumber,
      timestamp: new Date().toISOString(),
      items: cart.map(item => {
        const hasToppings = Array.isArray(item.toppings) && item.toppings.length > 0;
        return {
          id: item.id,
          nama: hasToppings 
            ? `${item.nama} (+ ${item.toppings.map(t => t.nama).join(', ')})` 
            : item.nama,
          qty: item.qty,
          harga: item.hargaCustom
        };
      }),
      subtotal: totalBayar,
      pajak: 0,
      grandTotal: totalBayar
    };

    // Amankan salinan data struk untuk template cetak sebelum cart di-reset
    const infoStrukUntukDicetak = {
      receiptNumber: currentReceiptNumber,
      timestamp: currentTimestamp,
      items: [...cart],
      total: totalBayar
    };

    const res = await fetch('/api/transaction', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      // 1. Simpan detail transaksi ke state struk cetak
      setActiveReceipt(infoStrukUntukDicetak);
      
      alert(`🎉 Pembayaran Sukses!\nNomor Struk: ${currentReceiptNumber}`);
      
      // 2. Beri jeda sejenak agar DOM ter-render, lalu panggil print dialog
      setTimeout(() => {
        window.print();
        // Clear isi keranjang setelah beres urusan cetak
        setCart([]);
      }, 300);

    } else {
      alert("Gagal memproses transaksi kasir.");
    }
  };

  // Objek Desain Layar POS Modern dengan dukungan CSS Print Media
  const styles = {
    container: { fontFamily: 'Arial, sans-serif', backgroundColor: '#f3f4f9', height: 'calc(100vh - 70px)', display: 'flex', flexDirection: 'column', margin: 0, padding: 0, boxSizing: 'border-box' },
    workspace: { display: 'flex', flex: 1, overflow: 'hidden' },
    menuSection: { flex: 1, padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' },
    searchBar: { width: '100%', padding: '12px 16px', border: '1px solid #cbd5e1', borderRadius: '12px', fontSize: '14px', outline: 'none', backgroundColor: '#ffffff', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', boxSizing: 'border-box' },
    menuGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px', marginTop: '8px' },
    menuCard: { backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' },
    badge: { fontSize: '10px', fontWeight: 'bold', padding: '4px 8px', borderRadius: '6px', alignSelf: 'flex-start', marginBottom: '10px' },
    cartSidebar: { width: '380px', backgroundColor: '#ffffff', borderLeft: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '24px', boxSizing: 'border-box' },
    cartHeader: { borderBottom: '1px solid #f1f5f9', paddingBottom: '16px', marginBottom: '16px' },
    cartList: { flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' },
    cartItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc', padding: '12px', borderRadius: '12px', border: '1px solid #f1f5f9' },
    qtyControl: { display: 'flex', alignItems: 'center', gap: '8px' },
    btnQty: { backgroundColor: '#ffffff', border: '1px solid #cbd5e1', color: '#1e293b', width: '28px', height: '28px', borderRadius: '8px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    checkoutCard: { borderTop: '1px solid #f1f5f9', paddingTop: '16px', marginTop: '16px' },
    btnCheckout: { width: '100%', backgroundColor: '#2563eb', color: '#ffffff', border: 'none', padding: '14px', borderRadius: '12px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer', marginTop: '12px', boxShadow: '0 4px 6px -1px rgba(37,99,235,0.2)' }
  };

  return (
    <div>
      {/* 🟢 STYLE TAG KHUSUS CETAK: Menyembunyikan aplikasi kasir & memunculkan area struk kecil saja saat di-print */}
      <style>{`
        /* Sembunyikan area struk secara default di layar monitor kasir biasa */
        #thermal-receipt-area {
          display: none;
        }

        @media print {
          body * {
            visibility: hidden;
          }
          #thermal-receipt-area, #thermal-receipt-area * {
            visibility: visible;
          }
          #thermal-receipt-area {
            display: block !important;
            position: absolute;
            left: 0;
            top: 0;
            width: 80mm; /* Lebar standar printer thermal kasir */
            padding: 2mm;
            font-family: 'Courier New', Courier, monospace; /* Font kasir klasik */
            color: #000;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* AREA LAYAR UTAMA KASIR (Akan otomatis disembunyikan printer saat cetak) */}
      <div style={styles.container} className="no-print">
        <div style={styles.workspace}>
          
          {/* PANEL KIRI: KATALOG PRODUK KASIR */}
          <div style={styles.menuSection}>
            <input 
              type="text" 
              placeholder="🔍 Cari menu makanan, minuman, atau ketik nama kategori..." 
              style={styles.searchBar}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8', fontWeight: 'bold' }}>Menghubungkan ke database menu...</div>
            ) : filteredMenus.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8', fontStyle: 'italic' }}>Menu yang Anda cari tidak ditemukan.</div>
            ) : (
              <div style={styles.menuGrid}>
                {filteredMenus.map((menu) => {
                  let bgB = '#e0f2fe'; let clB = '#0369a1';
                  if (menu.kategori === 'Makanan') { bgB = '#fef3c7'; clB = '#b45309'; }
                  else if (menu.kategori === 'Cemilan') { bgB = '#f3e8ff'; clB = '#6b21a8'; }

                  return (
                    <div 
                      key={menu.id} 
                      style={styles.menuCard}
                      onClick={() => handleMenuClick(menu)} 
                      onMouseEnter={(e) => e.currentTarget.style.borderColor = '#2563eb'}
                      onMouseLeave={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
                    >
                      <div>
                        <span style={{ ...styles.badge, backgroundColor: bgB, color: clB }}>{menu.kategori}</span>
                        <h4 style={{ margin: '0 0 6px 0', fontSize: '15px', color: '#1e293b', fontWeight: 'bold' }}>{menu.nama}</h4>
                        <p style={{ margin: '0', fontSize: '11px', color: '#94a3b8', fontFamily: 'monospace' }}>Kode: {menu.kode}</p>
                      </div>
                      <div style={{ marginTop: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '14px', fontWeight: '800', color: '#0f172a' }}>Rp {Number(menu.harga).toLocaleString('id-ID')}</span>
                        <span style={{ fontSize: '11px', color: '#16a34a', fontWeight: 'bold', backgroundColor: '#dcfce7', padding: '2px 6px', borderRadius: '4px' }}>Ready</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* PANEL KANAN: SIDEBAR KERANJANG BELANJA */}
          <div style={styles.cartSidebar}>
            <div>
              <div style={styles.cartHeader}>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  👤 Pelanggan Umum
                </h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#94a3b8' }}>Item dalam antrean pesanan aktif.</p>
              </div>

              <div style={styles.cartList}>
                {cart.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '60px 0', color: '#94a3b8' }}>
                    <div style={{ fontSize: '32px', marginBottom: '8px' }}>🛒</div>
                    <span style={{ fontSize: '13px', fontStyle: 'italic' }}>Keranjang masih kosong</span>
                  </div>
                ) : (
                  cart.map((item) => (
                    <div key={item.cartItemId} style={styles.cartItem}>
                      <div style={{ maxWidth: '180px' }}>
                        <h5 style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#1e293b', fontWeight: 'bold' }}>{item.nama}</h5>
                        {/* --- 🟢 TAMPILKAN LIST TOPPING DI BAWAH NAMA ITEM --- */}
                        {Array.isArray(item.toppings) && item.toppings.length > 0 && (
                          <div style={{ fontSize: '11px', color: '#ef4444', marginBottom: '4px', fontStyle: 'italic' }}>
                            + {item.toppings.map(t => t.nama).join(', ')}
                          </div>
                        )}
                        <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 'bold' }}>Rp {(item.hargaCustom * item.qty).toLocaleString('id-ID')}</span>
                      </div>
                      <div style={styles.qtyControl}>
                        <button onClick={() => removeFromCart(item.cartItemId)} style={styles.btnQty}>-</button>
                        <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#1e293b', minWidth: '16px', textAlign: 'center' }}>{item.qty}</span>
                        {/* --- 🛠️ FIX TOMBOL TAMBAH (+) DI SIDEBAR AGAR MEMBAWA TOPPING ASLINYA --- */}
                        <button onClick={() => executeAddToCart(item, item.toppings)} style={styles.btnQty}>+</button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div style={styles.checkoutCard}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 'bold' }}>TOTAL PEMBAYARAN:</span>
                <span style={{ fontSize: '20px', fontWeight: '900', color: '#2563eb' }}>Rp {totalBayar.toLocaleString('id-ID')}</span>
              </div>
              <button 
                onClick={handleCheckout} 
                style={{ 
                  ...styles.btnCheckout, 
                  backgroundColor: cart.length === 0 ? '#cbd5e1' : '#2563eb',
                  cursor: cart.length === 0 ? 'not-allowed' : 'pointer'
                }}
                disabled={cart.length === 0}
              >
                💼 Bayar & Cetak Struk
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* --- 🟢 UI MODAL POP-UP TOPPING (DENGAN TAMPILAN GELAP ELEGANT) --- */}
      {isToppingModalOpen && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center',
          backgroundColor: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            backgroundColor: '#1e293b', color: '#ffffff', width: '100%', maxWidth: '420px',
            borderRadius: '16px', padding: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.3)', fontFamily: 'Arial, sans-serif'
          }}>
            <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: 'bold', color: '#f8fafc' }}>
              🍜 Tambah Topping Terbaik
            </h3>
            <p style={{ margin: '0 0 16px 0', fontSize: '13px', color: '#94a3b8' }}>
              Pilihan ekstra untuk: <strong style={{ color: '#f59e0b' }}>{selectedMenu?.nama}</strong>
            </p>
            
            {/* List Item Topping */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '280px', overflowY: 'auto', paddingRight: '4px' }}>
              {daftarToppings.length === 0 ? (
                <div style={{ color: '#94a3b8', fontSize: '12px', textAlign: 'center', padding: '12px' }}>Tidak ada pilihan topping atau sedang memuat...</div>
              ) : (
                daftarToppings.map((topping) => {
                  const isChecked = selectedToppings.some(t => t.id === topping.id);
                  return (
                    <label 
                      key={topping.id} 
                      style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px',
                        borderRadius: '10px', border: isChecked ? '1px solid #3b82f6' : '1px solid #334155',
                        backgroundColor: isChecked ? '#1e3a8a' : '#0f172a', cursor: 'pointer', transition: 'all 0.2s'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <input 
                          type="checkbox" 
                          checked={isChecked}
                          onChange={() => handleToppingToggle(topping)}
                          style={{ width: '16px', height: '16px', cursor: 'pointer' }} 
                        />
                        <span style={{ fontSize: '13px', fontWeight: '500' }}>{topping.nama}</span>
                      </div>
                      <span style={{ fontSize: '12px', color: isChecked ? '#60a5fa' : '#94a3b8', fontWeight: 'bold' }}>
                        +Rp {Number(topping.harga).toLocaleString('id-ID')}
                      </span>
                    </label>
                  );
                })
              )}
            </div>

            {/* Tombol Footer Pop-up */}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'end', marginTop: '20px', borderTop: '1px solid #334155', paddingTop: '16px' }}>
              <button 
                onClick={() => setIsToppingModalOpen(false)}
                style={{ backgroundColor: '#334155', color: '#cbd5e1', border: 'none', padding: '10px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                Batal
              </button>
              <button 
                onClick={() => {
                  executeAddToCart(selectedMenu, selectedToppings);
                  setIsToppingModalOpen(false);
                }}
                style={{ backgroundColor: '#2563eb', color: '#ffffff', border: 'none', padding: '10px 18px', borderRadius: '8px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(37,99,235,0.4)' }}
              >
                Masukkan Keranjang
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 📑 STRUK TERSEMBUNYI */}
      {activeReceipt && (
        <div id="thermal-receipt-area" style={{ fontSize: '12px', lineHeight: '1.2' }}>
          <div style={{ textAlign: 'center', marginBottom: '10px' }}>
            <h3 style={{ margin: '0 0 2px 0', fontSize: '15px', fontWeight: 'bold' }}>INDORAMEN</h3>
            <p style={{ margin: 0, fontSize: '11px' }}>RUKO PMM</p>
            <p style={{ margin: 0, fontSize: '10px' }}>Jl. Boulevard Kalimaya 2, Curug Badak, Kec. Maja, Kabupaten Lebak, Banten 42381</p>
            <p style={{ margin: '5px 0 0 0' }}>--------------------------------</p>
          </div>
          
          <div style={{ marginBottom: '8px', fontSize: '11px' }}>
            <div>No. Struk: {activeReceipt.receiptNumber}</div>
            <div>Tanggal  : {activeReceipt.timestamp}</div>
            <div>Kasir    : Pelanggan Umum</div>
            <p style={{ margin: '5px 0 0 0' }}>--------------------------------</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '11px' }}>
            {activeReceipt.items.map((item, index) => (
              <div key={index}>
                <div style={{ fontWeight: 'bold' }}>
                  {item.nama}
                  {Array.isArray(item.toppings) && item.toppings.length > 0 && (
                    <span style={{ fontSize: '10px', fontWeight: 'normal', display: 'block' }}>
                      * Topping: {item.toppings.map(t => t.nama).join(', ')}
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>{item.qty} x Rp {item.hargaCustom.toLocaleString('id-ID')}</span>
                  <span>Rp {(item.hargaCustom * item.qty).toLocaleString('id-ID')}</span>
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '5px' }}>
            <p style={{ margin: '0 0 5px 0' }}>--------------------------------</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '13px' }}>
              <span>TOTAL:</span>
              <span>Rp {activeReceipt.total.toLocaleString('id-ID')}</span>
            </div>
            <p style={{ margin: '5px 0 0 0' }}>--------------------------------</p>
          </div>

          <div style={{ textAlign: 'center', marginTop: '15px', fontSize: '10px' }}>
            <p style={{ margin: 0 }}>Terima Kasih Atas Kunjungan Anda</p>
            <p style={{ margin: '2px 0 0 0' }}>Selamat Menikmati!</p>
          </div>
        </div>
      )}
    </div>
  );
}