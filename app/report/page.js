'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function LaporanPenjualanPage() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTransactions = () => {
    setLoading(true);
    fetch('/api/transaction')
      .then((res) => res.json())
      .then((data) => {
        const formattedData = data.map(tx => ({
          ...tx,
          items: typeof tx.items === 'string' ? JSON.parse(tx.items) : tx.items
        }));
        setTransactions(formattedData);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const totalOmzet = transactions.reduce((acc, curr) => acc + (curr.grandTotal || curr.totalBayar || 0), 0);

  const handleReset = async () => {
    const konfirmasi = confirm("Apakah Anda yakin ingin MERESET semua data laporan penjualan?");
    if (!konfirmasi) return;

    const passwordPencegah = prompt("Ketik 'RESET' untuk mengonfirmasi:");
    if (passwordPencegah !== 'RESET') return alert("Reset dibatalkan.");

    const res = await fetch('/api/transaction', { method: 'DELETE' });
    if (res.ok) {
      alert("Laporan penjualan berhasil direset!");
      setTransactions([]);
    } else {
      alert("Gagal mereset laporan.");
    }
  };

  const handleExportExcel = () => {
    if (transactions.length === 0) return alert("Tidak ada data untuk diexport!");

    let csvContent = "\uFEFF"; 
    csvContent += "Nomor Struk,Tanggal & Waktu,Item Terjual,Total Bayar\n";

    transactions.forEach((tx) => {
      const nomorStruk = tx.receiptNumber || tx.id;
      const tanggal = new Date(tx.timestamp || tx.createdAt).toLocaleString('id-ID').replace(/,/g, '');
      const itemTerjual = tx.items ? tx.items.map(item => `${item.nama} (x${item.qty})`).join(' | ') : '-';
      const totalBayar = tx.grandTotal || tx.totalBayar || 0;
      csvContent += `"${nomorStruk}","${tanggal}","${itemTerjual}","${totalBayar}"\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Laporan_Penjualan_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const styles = {
    container: { fontFamily: 'Arial, sans-serif', backgroundColor: '#f3f4f9', minHeight: '100vh', padding: '20px' },
    card: { backgroundColor: '#ffffff', borderRadius: '12px', padding: '24px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', maxWidth: '1100px', margin: '0 auto' },
    headerArea: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #f1f5f9', paddingBottom: '15px', marginBottom: '20px' },
    btnExcel: { backgroundColor: '#16a34a', color: '#ffffff', border: 'none', padding: '10px 16px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', marginRight: '10px' },
    btnReset: { backgroundColor: '#ef4444', color: '#ffffff', border: 'none', padding: '10px 16px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' },
    grid: { display: 'flex', gap: '15px', marginBottom: '20px' },
    widget: { flex: 1, padding: '20px', borderRadius: '10px', color: '#fff' },
    table: { width: '100%', borderCollapse: 'collapse', marginTop: '15px' },
    th: { backgroundColor: '#f8fafc', padding: '12px', textAlign: 'left', borderBottom: '2px solid #e2e8f0', color: '#64748b', fontSize: '12px' },
    td: { padding: '12px', borderBottom: '1px solid #edf2f7', fontSize: '14px' }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.headerArea}>
          <div>
            <h1 style={{ margin: 0, fontSize: '24px' }}>📊 Laporan Penjualan</h1>
            <p style={{ margin: '5px 0 0 0', color: '#64748b', fontSize: '13px' }}>Pantau pendapatan internal Indoramen PNM Kitchen.</p>
          </div>
          <div>
            <button onClick={handleExportExcel} style={styles.btnExcel}>🟢 Download Excel</button>
            <button onClick={handleReset} style={styles.btnReset}>🗑️ Reset Laporan</button>
          </div>
        </div>

        <div style={styles.grid}>
          <div style={{ ...styles.widget, background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}>
            <span style={{ fontSize: '12px', opacity: 0.9 }}>TOTAL OMZET BRUTO</span>
            <h2 style={{ margin: '5px 0 0 0', fontSize: '28px' }}>Rp {totalOmzet.toLocaleString('id-ID')}</h2>
          </div>
          <div style={{ ...styles.widget, background: '#1e293b' }}>
            <span style={{ fontSize: '12px', opacity: 0.9 }}>TOTAL TRANSAKSI</span>
            <h2 style={{ margin: '5px 0 0 0', fontSize: '28px' }}>{transactions.length} Struk</h2>
          </div>
        </div>

        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>NOMOR STRUK</th>
              <th style={styles.th}>TANGGAL & WAKTU</th>
              <th style={styles.th}>ITEM TERJUAL</th>
              <th style={{ ...styles.th, textAlign: 'right' }}>TOTAL BAYAR</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="4" style={{ textAlign: 'center', padding: '20px' }}>Memuat data...</td></tr>
            ) : transactions.length === 0 ? (
              <tr><td colSpan="4" style={{ textAlign: 'center', padding: '20px' }}>Belum ada data penjualan.</td></tr>
            ) : (
              transactions.map((tx, idx) => (
                <tr key={idx}>
                  <td style={{ ...styles.td, fontFamily: 'monospace', fontWeight: 'bold' }}>{tx.receiptNumber || tx.id}</td>
                  <td style={styles.td}>{new Date(tx.timestamp || tx.createdAt).toLocaleString('id-ID')}</td>
                  <td style={styles.td}>
                    {tx.items?.map((item, i) => (
                      <div key={i}>• {item.nama} <strong>(x{item.qty})</strong></div>
                    ))}
                  </td>
                  <td style={{ ...styles.td, textAlign: 'right', fontWeight: 'bold' }}>Rp {(tx.grandTotal || tx.totalBayar || 0).toLocaleString('id-ID')}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}