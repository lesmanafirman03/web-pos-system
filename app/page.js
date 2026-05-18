'use client';
import { useState, useEffect } from 'react';

export default function LayarKasirPage() {
  const [menus, setMenus] = useState([]);
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  
  // State tambahan untuk menyimpan info struk yang sedang dicetak
  const [activeReceipt, setActiveReceipt] = useState(null);

  // --- 🟢 STATE INTEGRASI POP-UP TOPPING ---
  const [isToppingModalOpen, setIsToppingModalOpen] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState(null);
  const [daftarToppings, setDaftarToppings] = useState([]);
  const [selectedToppings, setSelectedToppings] = useState([]);

  // --- 💡 STATE FITUR DINE IN / TAKE AWAY ---
  const [orderType, setOrderType] = useState('DINE_IN'); 
  const [customerName, setCustomerName] = useState('');  
  const [tableNumber, setTableNumber] = useState('');    

  // Ambil data menu & topping dari database
  useEffect(() => {
    fetch('/api/menu')
      .then((res) => res.json())
      .then((data) => {
        setMenus(Array.isArray(data) ? data : []);
        setLoading(false)
      })
      .catch(() => setLoading(false));

    fetch('/api/topping')
      .then((res) => res.json())
      .then((data) => setDaftarToppings(Array.isArray(data) ? data : []))
      .catch((err) => {
        console.error("Gagal memuat topping:", err);
        setDaftarToppings([]); 
      });
  }, []);

  // Filter pencarian
  const filteredMenus = menus.filter(menu => 
    menu.nama.toLowerCase().includes(search.toLowerCase()) ||
    menu.kategori.toLowerCase().includes(search.toLowerCase())
  );

  // Logika Cegat Menu untuk Makanan
  const handleMenuClick = (menu) => {
    if (menu.kategori === 'Makanan') {
      setSelectedMenu(menu);
      setSelectedToppings([]); 
      setIsToppingModalOpen(true); 
    } else {
      executeAddToCart(menu, []);
    }
  };

  // Toggle Seleksi Topping
  const handleToppingToggle = (topping) => {
    const exists = selectedToppings.find(t => t.id === topping.id);
    if (exists) {
      setSelectedToppings(selectedToppings.filter(t => t.id !== topping.id));
    } else {
      setSelectedToppings([...selectedToppings, topping]);
    }
  };

  // Memasukkan Menu ke Keranjang
  const executeAddToCart = (menu, toppingsList = []) => {
    const safeToppingsList = Array.isArray(toppingsList) ? toppingsList : [];
    const toppingIdsString = safeToppingsList.map(t => t.id).sort().join(',');
    const cartItemId = `${menu.id}-${toppingIdsString}`;

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
        cartItemId, 
        toppings: safeToppingsList, 
        hargaCustom: hargaFinalItem, 
        qty: 1 
      }]);
    }
  };

  // Kurangi/Hapus dari Keranjang
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

  const totalBayar = cart.reduce((acc, item) => acc + (item.hargaCustom * item.qty), 0);

  // Simpan Transaksi & Panggil Print Dialog
  const handleCheckout = async () => {
    if (cart.length === 0) return alert("Keranjang masih kosong!");
    if (!customerName.trim()) return alert("Nama pelanggan wajib diisi!");
    if (orderType === 'DINE_IN' && !tableNumber.trim()) return alert("Nomor meja wajib diisi untuk makan di tempat!");

    const konfirmasi = confirm(`Total Belanja: Rp ${totalBayar.toLocaleString('id-ID')}\nProses pembayaran transaksi sekarang?`);
    if (!konfirmasi) return;

    const currentReceiptNumber = `TRX-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${Math.floor(1000 + Math.random() * 9000)}`;
    const currentTimestamp = new Date().toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' });

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
      grandTotal: totalBayar,
      orderType: orderType,
      customerName: customerName,
      tableNumber: orderType === 'DINE_IN' ? tableNumber : null
    };

    const infoStrukUntukDicetak = {
      receiptNumber: currentReceiptNumber,
      timestamp: currentTimestamp,
      items: [...cart],
      total: totalBayar,
      orderType: orderType,
      customerName: customerName,
      tableNumber: orderType === 'DINE_IN' ? tableNumber : ''
    };

    const res = await fetch('/api/transaction', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      setActiveReceipt(infoStrukUntukDicetak);
      alert(`🎉 Pembayaran Sukses!\nNomor Struk: ${currentReceiptNumber}`);
      
      setTimeout(() => {
        window.print();
        setCart([]);
        setCustomerName('');
        setTableNumber('');
        setOrderType('DINE_IN');
      }, 300);
    } else {
      alert("Gagal memproses transaksi kasir.");
    }
  };

  return (
    <div className="font-sans bg-gray-100 min-h-screen selection:bg-red-500 selection:text-white">
      {/* STYLE TAG UNTUK PRINTER THERMAL KASIR */}
      <style>{`
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
            width: 58mm; /* Sesuai perbaikan thermal printer 58mm Anda */
            padding: 1mm;
            font-family: 'Courier New', Courier, monospace;
            color: #000;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* WORKSPACE UTAMA KASIR: Menggunakan Responsive Grid Tailwind */}
      <div className="no-print flex flex-col lg:flex-row h-screen w-full overflow-hidden">
        
        {/* PANEL KIRI: KATALOG PRODUK (Responsif & Scrollable) */}
        <div className="flex-1 p-4 md:p-6 overflow-y-auto flex flex-col gap-4">
          <div className="w-full">
            <input 
              type="text" 
              placeholder="🔍 Cari menu makanan, minuman, atau ketik nama kategori..." 
              className="w-full p-3.5 border border-gray-300 rounded-xl text-sm outline-none bg-white shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {loading ? (
            <div className="text-center py-10 text-gray-400 font-bold">Menghubungkan ke database menu...</div>
          ) : filteredMenus.length === 0 ? (
            <div className="text-center py-10 text-gray-400 italic">Menu yang Anda cari tidak ditemukan.</div>
          ) : (
            /* RESPONSIF GRID: HP=2 kolom, Tablet=3 kolom, Desktop kecil=4 kolom, Layar Besar=5 kolom */
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredMenus.map((menu) => {
                let badgeClass = 'bg-blue-100 text-blue-700';
                if (menu.kategori === 'Makanan') badgeClass = 'bg-amber-100 text-amber-700';
                else if (menu.kategori === 'Cemilan') badgeClass = 'bg-purple-100 text-purple-700';

                return (
                  <div 
                    key={menu.id} 
                    className="bg-white border border-gray-200 rounded-2xl p-4 flex flex-col justify-between cursor-pointer shadow-sm hover:border-blue-500 hover:shadow-md transition-all h-full"
                    onClick={() => handleMenuClick(menu)} 
                  >
                    <div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md inline-block mb-2.5 ${badgeClass}`}>
                        {menu.kategori}
                      </span>
                      <h4 className="text-sm md:text-base font-bold text-gray-800 line-clamp-2 mb-1">{menu.nama}</h4>
                      <p className="text-[11px] text-gray-400 font-monospace">Kode: {menu.kode}</p>
                    </div>
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-1">
                      <span className="text-sm md:text-base font-extrabold text-gray-900">Rp {Number(menu.harga).toLocaleString('id-ID')}</span>
                      <span className="text-[10px] text-green-700 font-bold bg-green-50 px-2 py-0.5 rounded-md">Ready</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* PANEL KANAN: SIDEBAR ANTRIAN & DETAIL TRANSAKSI */}
        {/* Mobile: Pindah ke bawah / desktop: Lebar tetap di samping */}
        <div className="w-full lg:w-[390px] bg-white border-t lg:border-t-0 lg:border-l border-gray-200 flex flex-col justify-between p-4 md:p-6 overflow-hidden max-h-[50vh] lg:max-h-screen">
          <div className="flex flex-col flex-1 overflow-y-auto pr-1">
            <div className="border-b border-gray-100 pb-3 mb-4">
              <h3 className="text-base font-bold text-gray-800 flex items-center gap-2">
                🛒 Antrean Pesanan Aktif
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">Sesuaikan detail pelanggan di bawah.</p>
            </div>

            {/* INPUT FORM DINE IN / TAKE AWAY INTERAKTIF */}
            <div className="mb-4 bg-gray-50 p-3.5 rounded-xl border border-gray-200 flex flex-col gap-3 text-left">
              <div>
                <label className="text-xs font-bold text-gray-600 block mb-1.5">Metode Layanan:</label>
                <div className="flex gap-2">
                  <button 
                    type="button"
                    className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${orderType === 'DINE_IN' ? 'bg-red-500 text-white shadow-sm' : 'bg-gray-200 text-gray-600'}`}
                    onClick={() => setOrderType('DINE_IN')}
                  >
                    Makan Sini
                  </button>
                  <button 
                    type="button"
                    className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${orderType === 'TAKE_AWAY' ? 'bg-red-500 text-white shadow-sm' : 'bg-gray-200 text-gray-600'}`}
                    onClick={() => setOrderType('TAKE_AWAY')}
                  >
                    Dibungkus
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-600 block mb-1">Atas Nama *</label>
                <input 
                  type="text" 
                  placeholder="Nama pelanggan..."
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg text-sm outline-none bg-white focus:border-blue-500 transition-all"
                />
              </div>

              {orderType === 'DINE_IN' && (
                <div>
                  <label className="text-xs font-bold text-gray-600 block mb-1">Nomor Meja *</label>
                  <input 
                    type="text" 
                    placeholder="Contoh: Meja 05"
                    value={tableNumber}
                    onChange={(e) => setTableNumber(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg text-sm outline-none bg-white focus:border-blue-500 transition-all"
                  />
                </div>
              )}
            </div>

            {/* List Item Keranjang */}
            <div className="flex flex-col gap-3 overflow-y-auto flex-1">
              {cart.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <div className="text-3xl mb-2">🍜</div>
                  <span className="text-xs italic">Keranjang masih kosong</span>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.cartItemId} className="flex justify-between items-center bg-gray-50 p-3 rounded-xl border border-gray-100 shadow-sm">
                    <div className="max-w-[180px] text-left">
                      <h5 className="text-xs md:text-sm font-bold text-gray-800 line-clamp-1">{item.nama}</h5>
                      {Array.isArray(item.toppings) && item.toppings.length > 0 && (
                        <div className="text-[11px] text-red-500 my-0.5 italic">
                          + {item.toppings.map(t => t.nama).join(', ')}
                        </div>
                      )}
                      <span className="text-xs font-bold text-gray-600">Rp {(item.hargaCustom * item.qty).toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => removeFromCart(item.cartItemId)} className="w-7 h-7 bg-white border border-gray-300 text-gray-800 rounded-lg font-bold flex items-center justify-center shadow-sm active:scale-95 transition-transform">-</button>
                      <span className="text-xs font-bold text-gray-800 min-w-[16px] text-center">{item.qty}</span>
                      <button onClick={() => executeAddToCart(item, item.toppings)} className="w-7 h-7 bg-white border border-gray-300 text-gray-800 rounded-lg font-bold flex items-center justify-center shadow-sm active:scale-95 transition-transform">+</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Bagian Total & Tombol Checkout */}
          <div className="border-t border-gray-200 pt-3 mt-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-gray-400">TOTAL PEMBAYARAN:</span>
              <span className="text-lg md:text-xl font-black text-blue-600">Rp {totalBayar.toLocaleString('id-ID')}</span>
            </div>
            <button 
              onClick={handleCheckout} 
              className={`w-full text-white border-none py-3.5 rounded-xl text-sm md:text-base font-bold mt-3 shadow-md transition-all active:scale-[0.99] ${cart.length === 0 ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
              disabled={cart.length === 0}
            >
              💼 Bayar & Cetak Struk
            </button>
          </div>
        </div>

      </div>

      {/* --- UI MODAL POP-UP TOPPING --- */}
      {isToppingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-800 text-white w-full max-w-md rounded-2xl p-6 shadow-2xl flex flex-col max-h-[90vh]">
            <h3 className="text-base md:text-lg font-bold text-slate-100">
              🍜 Tambah Topping Terbaik
            </h3>
            <p className="text-xs md:text-sm text-slate-400 mt-1 mb-4">
              Pilihan ekstra untuk: <strong className="text-amber-400">{selectedMenu?.nama}</strong>
            </p>
            
            {/* List Topping Scrollable */}
            <div className="flex flex-col gap-2.5 overflow-y-auto pr-1 flex-1">
              {daftarToppings.length === 0 ? (
                <div className="text-slate-400 text-xs text-center py-4">Tidak ada pilihan topping atau sedang memuat...</div>
              ) : (
                daftarToppings.map((topping) => {
                  const isChecked = selectedToppings.some(t => t.id === topping.id);
                  return (
                    <label 
                      key={topping.id} 
                      className={`flex justify-between items-center p-3.5 rounded-xl border cursor-pointer transition-all ${isChecked ? 'border-blue-500 bg-blue-950/60' : 'border-slate-700 bg-slate-900/60 hover:bg-slate-900'}`}
                    >
                      <div className="flex items-center gap-3">
                        <input 
                          type="checkbox" 
                          checked={isChecked}
                          onChange={() => handleToppingToggle(topping)}
                          className="w-4 h-4 rounded accent-blue-500 cursor-pointer" 
                        />
                        <span className="text-xs md:text-sm font-medium">{topping.nama}</span>
                      </div>
                      <span className={`text-xs font-bold ${isChecked ? 'text-blue-400' : 'text-slate-400'}`}>
                        +Rp {Number(topping.harga).toLocaleString('id-ID')}
                      </span>
                    </label>
                  );
                })
              )}
            </div>

            {/* Tombol Footer */}
            <div className="flex gap-3 justify-end mt-5 border-t border-slate-700 pt-4">
              <button 
                onClick={() => setIsToppingModalOpen(false)}
                className="bg-slate-700 text-slate-200 px-4 py-2.5 rounded-lg text-xs md:text-sm font-bold hover:bg-slate-600 transition-colors"
              >
                Batal
              </button>
              <button 
                onClick={() => {
                  executeAddToCart(selectedMenu, selectedToppings);
                  setIsToppingModalOpen(false);
                }}
                className="bg-blue-600 text-white px-5 py-2.5 rounded-lg text-xs md:text-sm font-bold hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-colors"
              >
                Masukkan Keranjang
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 📑 STRUK PRINT THERMAL AREA */}
      {activeReceipt && (
        <div id="thermal-receipt-area" style={{ fontSize: '11px', lineHeight: '1.2' }}>
          <div style={{ textAlign: 'center', marginBottom: '8px' }}>
            <h3 style={{ margin: '0 0 2px 0', fontSize: '14px', fontWeight: 'bold' }}>INDORAMEN</h3>
            <p style={{ margin: 0, fontSize: '10px' }}>RUKO PMM</p>
            <p style={{ margin: 0, fontSize: '9px' }}>Jl. Boulevard Kalimaya 2, Curug Badak, Kec. Maja, Banten</p>
            <p style={{ margin: '4px 0 0 0' }}>--------------------------------</p>
          </div>
          
          <div style={{ marginBottom: '6px', fontSize: '10px' }}>
            <div>No. Struk : {activeReceipt.receiptNumber}</div>
            <div>Tanggal  : {activeReceipt.timestamp}</div>
            <div>Layanan  : {activeReceipt.orderType === 'DINE_IN' ? 'DINE IN' : 'TAKE AWAY'}</div>
            <div>Pelanggan: {activeReceipt.customerName}</div>
            {activeReceipt.orderType === 'DINE_IN' && (
              <div>No. Meja : {activeReceipt.tableNumber}</div>
            )}
            <div>Kasir    : Staff Kasir</div>
            <p style={{ margin: '4px 0 0 0' }}>--------------------------------</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '10px' }}>
            {activeReceipt.items.map((item, index) => (
              <div key={index}>
                <div style={{ fontWeight: 'bold' }}>
                  {item.nama}
                  {Array.isArray(item.toppings) && item.toppings.length > 0 && (
                    <span style={{ fontSize: '9px', fontWeight: 'normal', display: 'block' }}>
                      * Topping: {item.toppings.map(t => t.nama).join(', ')}
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', justifyBetween: 'space-between', justifyContent: 'space-between' }}>
                  <span>{item.qty} x Rp {item.hargaCustom.toLocaleString('id-ID')}</span>
                  <span>Rp {(item.hargaCustom * item.qty).toLocaleString('id-ID')}</span>
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '4px' }}>
            <p style={{ margin: '0 0 4px 0' }}>--------------------------------</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '12px' }}>
              <span>TOTAL:</span>
              <span>Rp {activeReceipt.total.toLocaleString('id-ID')}</span>
            </div>
            <p style={{ margin: '4px 0 0 0' }}>--------------------------------</p>
          </div>

          <div style={{ textAlign: 'center', marginTop: '10px', fontSize: '9px' }}>
            <p style={{ margin: 0 }}>Terima Kasih Atas Kunjungan Anda</p>
            <p style={{ margin: '2px 0 0 0' }}>Selamat Menikmati!</p>
          </div>
        </div>
      )}
    </div>
  );
}