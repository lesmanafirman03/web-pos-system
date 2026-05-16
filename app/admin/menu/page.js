'use client';
import { useState, useEffect } from 'react';

export default function AdminMenuPage() {
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [kode, setKode] = useState('');
  const [nama, setNama] = useState('');
  const [kategori, setKategori] = useState('');
  const [harga, setHarga] = useState('');
  const [editingId, setEditingId] = useState(null);

  // Ambil Data Menu dari API
  const fetchMenus = () => {
    setLoading(true);
    fetch('/api/menu')
      .then((res) => res.json())
      .then((data) => {
        setMenus(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchMenus();
  }, []);

  // Simpan atau Edit Menu
  const handleSimpanMenu = async (e) => {
    e.preventDefault();
    if (!kode || !nama || !kategori || !harga) return alert("Semua kolom harus diisi!");

    const payload = { kode, nama, kategori, harga: Number(harga) };
    const url = '/api/menu';
    const method = editingId ? 'PUT' : 'POST';

    if (editingId) payload.id = editingId;

    const res = await fetch(url, {
      method: method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      alert(editingId ? "Menu berhasil diperbarui!" : "Menu baru berhasil ditambahkan!");
      resetForm();
      fetchMenus();
    } else {
      alert("Gagal menyimpan data menu.");
    }
  };

  // Hapus Menu
  const handleHapusMenu = async (id) => {
    if (!confirm("Apakah Anda yakin ingin menghapus menu ini?")) return;

    const res = await fetch(`/api/menu?id=${id}`, { method: 'DELETE' });
    if (res.ok) {
      alert("Menu berhasil dihapus!");
      fetchMenus();
    } else {
      alert("Gagal menghapus menu.");
    }
  };

  // Set Form untuk Edit
  const handleEditClick = (menu) => {
    setEditingId(menu.id);
    setKode(menu.kode);
    setNama(menu.nama);
    setKategori(menu.kategori);
    setHarga(menu.harga);
  };

  const resetForm = () => {
    setEditingId(null);
    setKode('');
    setNama('');
    setKategori('');
    setHarga('');
  };

  // Objek Desain Komponen UI Modern Bersih (Tanpa Navigasi Ganda)
  const styles = {
    container: { fontFamily: 'Arial, sans-serif', backgroundColor: '#f3f4f9', minHeight: 'calc(100vh - 70px)', padding: '0', margin: '0', boxSizing: 'border-box' },
    main: { padding: '32px', maxWidth: '1100px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' },
    card: { backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' },
    title: { fontSize: '20px', fontWeight: '800', color: '#1e293b', margin: '0 0 4px 0' },
    subtitle: { fontSize: '13px', color: '#94a3b8', margin: '0 0 20px 0' },
    formGroup: { marginBottom: '16px' },
    label: { display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#475569', marginBottom: '6px' },
    input: { width: '100%', padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box', outline: 'none', transition: 'border 0.2s' },
    select: { width: '100%', padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', backgroundColor: '#ffffff', boxSizing: 'border-box' },
    btnPrimary: { width: '100%', backgroundColor: '#2563eb', color: '#ffffff', border: 'none', padding: '12px', borderRadius: '10px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' },
    btnCancel: { width: '100%', backgroundColor: '#f1f5f9', color: '#475569', border: 'none', padding: '10px', borderRadius: '10px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', marginTop: '6px' },
    table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' },
    th: { backgroundColor: '#f8fafc', padding: '12px 16px', fontSize: '12px', fontWeight: 'bold', color: '#64748b', borderBottom: '1px solid #e2e8f0' },
    td: { padding: '16px', borderBottom: '1px solid #f1f5f9', color: '#334155', verticalAlign: 'middle' },
    badge: { padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', display: 'inline-block' },
    btnActionEdit: { backgroundColor: '#fef3c7', color: '#d97706', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', marginRight: '6px' },
    btnActionHapus: { backgroundColor: '#fef2f2', color: '#dc2626', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }
  };

  return (
    <div style={styles.container}>

      {/* WORKSPACE AREA (2 KOLOM: INPUT & TABEL) */}
      <div style={styles.main}>
        
        {/* KOLOM KIRI: FORM ENTRI MENU */}
        <div style={styles.card}>
          <h2 style={styles.title}>{editingId ? '📝 Edit Data Menu' : '✨ Tambah Menu Baru'}</h2>
          <p style={styles.subtitle}>Isi informasi detail katalog produk makanan atau minuman kasir.</p>
          
          <form onSubmit={handleSimpanMenu}>
            <div style={styles.formGroup}>
              <label style={styles.label}>KODE MENU</label>
              <input 
                type="text" 
                placeholder="Contoh: M004" 
                style={styles.input}
                value={kode}
                onChange={(e) => setKode(e.target.value)}
                disabled={editingId !== null}
              />
            </div>
            
            <div style={styles.formGroup}>
              <label style={styles.label}>NAMA MENU</label>
              <input 
                type="text" 
                placeholder="Masukkan nama makanan/minuman" 
                style={styles.input}
                value={nama}
                onChange={(e) => setNama(e.target.value)}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>KATEGORI</label>
              <select 
                style={styles.select}
                value={kategori}
                onChange={(e) => setKategori(e.target.value)}
              >
                <option value="">-- Pilih Kategori --</option>
                <option value="Makanan">Makanan</option>
                <option value="Minuman">Minuman</option>
                <option value="Cemilan">Cemilan</option>
              </select>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>HARGA JUAL (RP)</label>
              <input 
                type="number" 
                placeholder="Contoh: 15000" 
                style={styles.input}
                value={harga}
                onChange={(e) => setHarga(e.target.value)}
              />
            </div>

            <button type="submit" style={styles.btnPrimary}>
              {editingId ? 'Simpan Perubahan' : '➕ Daftarkan Menu'}
            </button>
            
            {editingId && (
              <button type="button" onClick={resetForm} style={styles.btnCancel}>
                Batal Edit
              </button>
            )}
          </form>
        </div>

        {/* KOLOM KANAN: DAFTAR KATALOG AKTIF */}
        <div style={styles.card}>
          <h2 style={styles.title}>📦 Daftar Menu Terdaftar</h2>
          <p style={styles.subtitle}>Total terdapat {menus.length} produk aktif dalam database kasir Anda.</p>

          <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>KODE</th>
                  <th style={styles.th}>NAMA MENU</th>
                  <th style={styles.th}>KATEGORI</th>
                  <th style={styles.th}>HARGA KASIR</th>
                  <th style={{ ...styles.th, textAlign: 'center' }}>AKSI</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="5" style={{ ...styles.td, textAlign: 'center', padding: '32px', color: '#94a3b8' }}>Memuat database produk...</td>
                  </tr>
                ) : menus.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ ...styles.td, textAlign: 'center', padding: '32px', color: '#94a3b8', fontStyle: 'italic' }}>Belum ada menu terdaftar. Silakan tambahkan menu baru di panel kiri.</td>
                  </tr>
                ) : (
                  menus.map((menu, idx) => {
                    let badgeBg = '#e0f2fe'; let badgeColor = '#0369a1';
                    if (menu.kategori === 'Makanan') { badgeBg = '#fef3c7'; badgeColor = '#b45309'; }
                    else if (menu.kategori === 'Cemilan') { badgeBg = '#f3e8ff'; badgeColor = '#6b21a8'; }

                    return (
                      <tr key={menu.id || idx} style={{ backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                        <td style={{ ...styles.td, fontFamily: 'monospace', fontWeight: 'bold', color: '#475569' }}>{menu.kode}</td>
                        <td style={{ ...styles.td, fontWeight: 'bold', color: '#1e293b' }}>{menu.nama}</td>
                        <td style={styles.td}>
                          <span style={{ ...styles.badge, backgroundColor: badgeBg, color: badgeColor }}>
                            {menu.kategori}
                          </span>
                        </td>
                        <td style={{ ...styles.td, fontWeight: 'bold', color: '#0f172a' }}>
                          Rp {Number(menu.harga).toLocaleString('id-ID')}
                        </td>
                        <td style={{ ...styles.td, textAlign: 'center' }}>
                          <button onClick={() => handleEditClick(menu)} style={styles.btnActionEdit}>✏️ Edit</button>
                          <button onClick={() => handleHapusMenu(menu.id)} style={styles.btnActionHapus}>🗑️ Hapus</button>
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