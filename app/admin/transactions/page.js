'use client';
import { useState, useEffect } from 'react';

export default function AdminTransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Ambil data dari endpoint API bawaan kode lama Anda
  const fetchTransactions = () => {
    setLoading(true);
    fetch('/api/admin/transactions')
      .then((res) => res.json())
      .then((data) => {
        setTransactions(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  // Menghitung total omzet pendapatan dari seluruh transaksi
  const totalOmzet = transactions.reduce((acc, curr) => acc + (curr.grandTotal || 0), 0);

  // 1. FITUR RESET LAPORAN (DELETE KE API)
  const handleReset = async () => {
    const konfirmasi = confirm("Apakah Anda yakin ingin MERESET semua data transaksi? Tindakan ini menghapus seluruh laporan permanen.");
    if (!konfirmasi) return;

    const passwordPencegah = prompt("Ketik 'RESET' untuk mengonfirmasi tindakan ini:");
    if (passwordPencegah !== 'RESET') {
      alert("Reset dibatalkan. Kata sandi konfirmasi salah.");
      return;
    }

    const res = await fetch('/api/transaction', { method: 'DELETE' });
    if (res.ok) {
      alert("Semua data transaksi berhasil direset menjadi kosong!");
      setTransactions([]);
    } else {
      alert("Gagal mereset data laporan.");
    }
  };

  // 2. FITUR DOWNLOAD EXPORT KE EXCEL (.CSV)
  const handleExportExcel = () => {
    if (transactions.length === 0) return alert("Tidak ada data transaksi untuk diexport!");

    let csvContent = "\uFEFF"; // BOM agar Excel membaca karakter UTF-8 dengan rapi
    csvContent += "Nomor Struk,Tanggal & Waktu,Item Terjual,Total Bayar\n";

    transactions.forEach((tx) => {
      const nomorStruk = tx.receiptNumber || tx.id;
      const tanggal = new Date(tx.timestamp).toLocaleString('id-ID').replace(/,/g, '');
      
      const itemsArray = typeof tx.items === 'string' ? JSON.parse(tx.items) : tx.items;
      const itemTerjual = itemsArray ? itemsArray.map(item => `${item.nama} (x${item.qty})`).join(' | ') : '-';
      const totalBayar = tx.grandTotal || 0;

      csvContent += `"${nomorStruk}","${tanggal}","${itemTerjual}","${totalBayar}"\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Laporan_Transaksi_Indoramen_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Objek Styling Manual Bersih Tanpa Navigasi Ganda
  const styles = {
    container: { fontFamily: 'Arial, sans-serif', backgroundColor: '#f3f4f9', minHeight: 'calc(100vh - 70px)', padding: '0', margin: '0', boxSizing: 'border-box' },
    main: { padding: '32px', maxWidth: '1100px', margin: '0 auto' },
    card: { backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' },
    headerArea: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '20px', marginBottom: '20px' },
    title: { fontSize: '24px', fontWeight: '800', color: '#1e293b', margin: '0' },
    subtitle: { fontSize: '13px', color: '#94a3b8', margin: '4px 0 0 0' },
    btnArea: { display: 'flex', gap: '10px' },
    btnExcel: { backgroundColor: '#16a34a', color: '#ffffff', border: 'none', padding: '10px 18px', borderRadius: '10px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer' },
    btnReset: { backgroundColor: '#fef2f2', color: '#dc2626', border: '1px solid #fca5a5', padding: '10px 18px', borderRadius: '10px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer' },
    widgetGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' },
    widgetPurple: { background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', color: '#ffffff', padding: '20px', borderRadius: '16px' },
    widgetSlate: { backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', padding: '20px', borderRadius: '16px' },
    table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' },
    th: { backgroundColor: '#f8fafc', padding: '12px 16px', fontSize: '12px', fontWeight: 'bold', color: '#64748b', borderBottom: '1px solid #e2e8f0' },
    td: { padding: '16px', borderBottom: '1px solid #f1f5f9', color: '#334155' }
  };

  if (loading) {
    return <div style={{ padding: '50px', textAlign: 'center', color: '#64748b', fontWeight: 'bold', fontFamily: 'Arial' }}>Memuat data laporan...</div>;
  }

  return (
    <div style={styles.container}>
      
      {/* DASHBOARD UTAMA */}
      <div style={styles.main}>
        <div style={styles.card}>
          
          {/* JUDUL DAN PANEL ACTION */}
          <div style={styles.headerArea}>
            <div>
              <h1 style={styles.title}>📊 Laporan Penjualan</h1>
              <p style={styles.subtitle}>Pantau total pendapatan, hapus log database, dan unduh rekapan excel toko.</p>
            </div>
            <div style={styles.btnArea}>
              <button onClick={handleExportExcel} style={styles.btnExcel}>
                🟢 Export ke Excel
              </button>
              <button onClick={handleReset} style={styles.btnReset}>
                🗑️ Reset Laporan
              </button>
            </div>
          </div>

          {/* TOTAL OMZET SUMMARY INFOGRAPHICS */}
          <div style={styles.widgetGrid}>
            <div style={styles.widgetPurple}>
              <p style={{ fontSize: '11px', margin: '0', opacity: 0.8, fontWeight: 'bold' }}>TOTAL OMZET BRUTO</p>
              <h3 style={{ fontSize: '28px', margin: '6px 0 0 0', fontWeight: '900' }}>Rp {totalOmzet.toLocaleString('id-ID')}</h3>
            </div>
            <div style={styles.widgetSlate}>
              <p style={{ fontSize: '11px', margin: '0', color: '#94a3b8', fontWeight: 'bold' }}>JUMLAH TRANSAKSI DI DATABASE</p>
              <h3 style={{ fontSize: '24px', margin: '6px 0 0 0', fontWeight: 'bold', color: '#1e293b' }}>{transactions.length} Struk Masuk</h3>
            </div>
          </div>

          {/* DATA TABEL RIWAYAT TRANSAKSI */}
          <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Nomor Struk</th>
                  <th style={styles.th}>Tanggal & Waktu</th>
                  <th style={styles.th}>Item Terjual</th>
                  <th style={{ ...styles.th, textAlign: 'right', paddingRight: '24px' }}>Total Bayar</th>
                </tr>
              </thead>
              <tbody>
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ ...styles.td, textAlign: 'center', padding: '40px', color: '#94a3b8', fontStyle: 'italic' }}>
                      Belum ada transaksi yang tercatat di kasir depan.
                    </td>
                  </tr>
                ) : (
                  transactions.map((tx, idx) => {
                    const itemsArray = typeof tx.items === 'string' ? JSON.parse(tx.items) : tx.items;
                    return (
                      <tr key={tx.id || idx} style={{ backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                        <td style={{ ...styles.td, fontFamily: 'monospace', fontWeight: 'bold', color: '#2563eb' }}>{tx.receiptNumber}</td>
                        <td style={{ ...styles.td, fontSize: '13px' }}>{new Date(tx.timestamp).toLocaleString('id-ID')}</td>
                        <td style={styles.td}>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                            {itemsArray && itemsArray.map((item, idxItem) => (
                              <div key={idxItem} style={{ backgroundColor: '#e2e8f0', color: '#1e293b', padding: '4px 8px', borderRadius: '6px', fontSize: '12px' }}>
                                {item.nama} <span style={{ fontWeight: 'bold', color: '#2563eb' }}>x{item.qty}</span>
                              </div>
                            ))}
                          </div>
                        </td>
                        <td style={{ ...styles.td, textAlign: 'right', fontWeight: 'bold', color: '#0f172a', paddingRight: '24px' }}>
                          Rp {tx.grandTotal.toLocaleString('id-ID')}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

        </div>
      </div>
    </div>
  );
}