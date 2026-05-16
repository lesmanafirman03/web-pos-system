const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Memulai proses seeder data menu INDORAMEN...');

  // Bersihkan data menu lama terlebih dahulu agar tidak duplikat saat dijalankan ulang
  await prisma.menu.deleteMany({});

  const daftarMenu = [
    // ==========================================
    // 1. KATEGORI: MAKANAN (Indo Ramen & Mie)
    // ==========================================
    { kode: 'M001', nama: 'Indo Ramen Original - LVL 0', kategori: 'Makanan', harga: 10000 },
    { kode: 'M002', nama: 'Indo Ramen Original - LVL 0,5 - 1', kategori: 'Makanan', harga: 11000 },
    { kode: 'M003', nama: 'Indo Ramen Original - LVL 2 - 3', kategori: 'Makanan', harga: 12000 },
    { kode: 'M004', nama: 'Indo Ramen Original - LVL 4 - 5', kategori: 'Makanan', harga: 13000 },
    { kode: 'M005', nama: 'Indo Ramen Original - LVL 6 - 7', kategori: 'Makanan', harga: 15000 },
    { kode: 'M006', nama: 'Indo Ramen Original - LVL 8 - 10', kategori: 'Makanan', harga: 17000 },
    
    { kode: 'M007', nama: 'Indo Ramen Black Pepper - LVL Normal', kategori: 'Makanan', harga: 11000 },
    { kode: 'M008', nama: 'Indo Ramen Black Pepper - LVL 0,5 - 1', kategori: 'Makanan', harga: 12000 },
    { kode: 'M009', nama: 'Indo Ramen Black Pepper - LVL 2 - 3', kategori: 'Makanan', harga: 13000 },
    { kode: 'M010', nama: 'Indo Ramen Black Pepper - LVL 4 - 5', kategori: 'Makanan', harga: 15000 },
    { kode: 'M011', nama: 'Indo Ramen Black Pepper - LVL 6 - 7', kategori: 'Makanan', harga: 16000 },
    { kode: 'M012', nama: 'Indo Ramen Black Pepper - LVL 8 - 10', kategori: 'Makanan', harga: 18000 },

    { kode: 'M013', nama: 'Mie MPM Original - LVL 0', kategori: 'Makanan', harga: 10000 },
    { kode: 'M014', nama: 'Mie MPM Original - LVL 0,5 - 1', kategori: 'Makanan', harga: 11000 },
    { kode: 'M015', nama: 'Mie MPM Original - LVL 2 - 3', kategori: 'Makanan', harga: 12000 },
    { kode: 'M016', nama: 'Mie MPM Original - LVL 4 - 5', kategori: 'Makanan', harga: 13000 },
    { kode: 'M017', nama: 'Mie MPM Original - LVL 6 - 7', kategori: 'Makanan', harga: 15000 },
    { kode: 'M018', nama: 'Mie MPM Original - LVL 8 - 10', kategori: 'Makanan', harga: 17000 },

    { kode: 'M019', nama: 'Mie MPM Black Pepper - LVL Normal', kategori: 'Makanan', harga: 11000 },
    { kode: 'M020', nama: 'Mie MPM Black Pepper - LVL 0,5 - 1', kategori: 'Makanan', harga: 12000 },
    { kode: 'M021', nama: 'Mie MPM Black Pepper - LVL 2 - 3', kategori: 'Makanan', harga: 13000 },
    { kode: 'M022', nama: 'Mie MPM Black Pepper - LVL 4 - 5', kategori: 'Makanan', harga: 15000 },
    { kode: 'M023', nama: 'Mie MPM Black Pepper - LVL 6 - 7', kategori: 'Makanan', harga: 16000 },
    { kode: 'M024', nama: 'Mie MPM Black Pepper - LVL 8 - 10', kategori: 'Makanan', harga: 18000 },

    { kode: 'M025', nama: 'Spaghetti - LVL 0 - 0,5', kategori: 'Makanan', harga: 12000 },
    { kode: 'M026', nama: 'Spaghetti - LVL 1 - 2', kategori: 'Makanan', harga: 14000 },
    { kode: 'M027', nama: 'Spaghetti - LVL 3 - 4', kategori: 'Makanan', harga: 15000 },

    { kode: 'M028', nama: 'Mie Bangladesh - LVL 0,5 - 1', kategori: 'Makanan', harga: 10000 },
    { kode: 'M029', nama: 'Mie Bangladesh - LVL 2 - 3', kategori: 'Makanan', harga: 11000 },
    { kode: 'M030', nama: 'Mie Bangladesh - LVL 4 - 5', kategori: 'Makanan', harga: 12000 },
    { kode: 'M031', nama: 'Mie Bangladesh - LVL 6 - 8', kategori: 'Makanan', harga: 13000 },
    { kode: 'M032', nama: 'Mie Bangladesh - LVL 9 - 10', kategori: 'Makanan', harga: 15000 },

    { kode: 'M033', nama: 'Mie Seblak - LVL Normal', kategori: 'Makanan', harga: 7000 },
    { kode: 'M034', nama: 'Mie Seblak - LVL 0,5 - 2', kategori: 'Makanan', harga: 8000 },
    { kode: 'M035', nama: 'Mie Seblak - LVL 3 - 4', kategori: 'Makanan', harga: 9000 },
    { kode: 'M036', nama: 'Mie Seblak - LVL 5 - 6', kategori: 'Makanan', harga: 10000 },

    // ==========================================
    // 2. KATEGORI: CEMILAN (Side Dish)
    // ==========================================
    { kode: 'C001', nama: 'Corndog Original', kategori: 'Cemilan', harga: 12000 },
    { kode: 'C002', nama: 'Corndog Coklat', kategori: 'Cemilan', harga: 13000 },
    { kode: 'C003', nama: 'Corndog Tiramisu', kategori: 'Cemilan', harga: 13000 },
    { kode: 'C004', nama: 'Corndog Greentea', kategori: 'Cemilan', harga: 13000 },
    { kode: 'C005', nama: 'Corndog Kentang', kategori: 'Cemilan', harga: 13000 },
    { kode: 'C006', nama: 'French Fries', kategori: 'Cemilan', harga: 10000 },
    { kode: 'C007', nama: 'Tangsis Sedang', kategori: 'Cemilan', harga: 12000 },
    { kode: 'C008', nama: 'Tangsis Besar', kategori: 'Cemilan', harga: 20000 },
    { kode: 'C009', nama: 'Sosis Jumbo Goreng', kategori: 'Cemilan', harga: 10000 },
    { kode: 'C010', nama: 'Bakso Goreng', kategori: 'Cemilan', harga: 10000 },

    // ==========================================
    // 3. KATEGORI: MINUMAN (Beverages)
    // ==========================================
    { kode: 'D001', nama: 'Teh Tawar (Hot)', kategori: 'Minuman', harga: 3000 },
    { kode: 'D002', nama: 'Teh Tawar (Ice)', kategori: 'Minuman', harga: 4000 },
    { kode: 'D003', nama: 'Teh Manis (Hot)', kategori: 'Minuman', harga: 5000 },
    { kode: 'D004', nama: 'Teh Manis (Ice)', kategori: 'Minuman', harga: 6000 },
    { kode: 'D005', nama: 'Teh Tarik (Hot)', kategori: 'Minuman', harga: 5000 },
    { kode: 'D006', nama: 'Teh Tarik (Ice)', kategori: 'Minuman', harga: 7000 },
    { kode: 'D007', nama: 'Teh Pucuk', kategori: 'Minuman', harga: 5000 },
    { kode: 'D008', nama: 'Lemon Tea (Hot)', kategori: 'Minuman', harga: 5000 },
    { kode: 'D009', nama: 'Lemon Tea (Ice)', kategori: 'Minuman', harga: 6000 },
    { kode: 'D010', nama: 'Matcha (Hot)', kategori: 'Minuman', harga: 5000 },
    { kode: 'D011', nama: 'Matcha (Ice)', kategori: 'Minuman', harga: 7000 },
    { kode: 'D012', nama: 'Coklat (Hot)', kategori: 'Minuman', harga: 5000 },
    { kode: 'D013', nama: 'Coklat (Ice)', kategori: 'Minuman', harga: 6000 },
    { kode: 'D014', nama: 'Nutrisari Anggur (Hot)', kategori: 'Minuman', harga: 5000 },
    { kode: 'D015', nama: 'Nutrisari Anggur (Ice)', kategori: 'Minuman', harga: 6000 },
    { kode: 'D016', nama: 'Nutrisari Jeruk Peras (Hot)', kategori: 'Minuman', harga: 5000 },
    { kode: 'D017', nama: 'Nutrisari Jeruk Peras (Ice)', kategori: 'Minuman', harga: 6000 },
    { kode: 'D018', nama: 'Nutrisari Sweet Orange (Hot)', kategori: 'Minuman', harga: 5000 },
    { kode: 'D019', nama: 'Nutrisari Sweet Orange (Ice)', kategori: 'Minuman', harga: 6000 },
    { kode: 'D020', nama: 'Nutrisari Sweet Mango (Hot)', kategori: 'Minuman', harga: 5000 },
    { kode: 'D021', nama: 'Nutrisari Sweet Mango (Ice)', kategori: 'Minuman', harga: 6000 },
    { kode: 'D022', nama: 'Mineral Water', kategori: 'Minuman', harga: 5000 },
    { kode: 'D023', nama: 'Milo (Hot)', kategori: 'Minuman', harga: 5000 },
    { kode: 'D024', nama: 'Milo (Ice)', kategori: 'Minuman', harga: 7000 },
    { kode: 'D025', nama: 'Extra Joss', kategori: 'Minuman', harga: 6000 },
    { kode: 'D026', nama: 'Kopi Hitam Panas', kategori: 'Minuman', harga: 5000 },
    { kode: 'D027', nama: 'Kopi Susu Panas', kategori: 'Minuman', harga: 5000 },
    { kode: 'D028', nama: 'Kopi Luwak (Hot)', kategori: 'Minuman', harga: 5000 },
    { kode: 'D029', nama: 'Kopi Luwak (Ice)', kategori: 'Minuman', harga: 6000 },
    { kode: 'D030', nama: 'Creamy Latte (Hot)', kategori: 'Minuman', harga: 5000 },
    { kode: 'D031', nama: 'Creamy Latte (Ice)', kategori: 'Minuman', harga: 6000 },
    { kode: 'D032', nama: 'Good Day Original (Hot)', kategori: 'Minuman', harga: 5000 },
    { kode: 'D033', nama: 'Good Day Original (Ice)', kategori: 'Minuman', harga: 6000 },
    { kode: 'D034', nama: 'Good Day Freeze (Hot)', kategori: 'Minuman', harga: 5000 },
    { kode: 'D035', nama: 'Good Day Freeze (Ice)', kategori: 'Minuman', harga: 7000 },
    { kode: 'D036', nama: 'Good Day Mocacinno (Hot)', kategori: 'Minuman', harga: 5000 },
    { kode: 'D037', nama: 'Good Day Mocacinno (Ice)', kategori: 'Minuman', harga: 6000 },
    { kode: 'D038', nama: 'Good Day Cappucino (Hot)', kategori: 'Minuman', harga: 5000 },
    { kode: 'D039', nama: 'Good Day Cappucino (Ice)', kategori: 'Minuman', harga: 7000 },
    { kode: 'D040', nama: 'Americano (Hot)', kategori: 'Minuman', harga: 5000 },
    { kode: 'D041', nama: 'Americano (Ice)', kategori: 'Minuman', harga: 7000 },

    // ==========================================
    // 4. KATEGORI: TOPPING (Tambahan Mie)
    // ==========================================
    { kode: 'T001', nama: 'Siomay Kering/Lidah', kategori: 'Topping', harga: 3000 },
    { kode: 'T002', nama: 'Mayo', kategori: 'Topping', harga: 3000 },
    { kode: 'T003', nama: 'Pilus Cikur', kategori: 'Topping', harga: 3000 },
    { kode: 'T004', nama: 'Keju Parut', kategori: 'Topping', harga: 3000 },
    { kode: 'T005', nama: 'Chikuwa/Crabstick', kategori: 'Topping', harga: 3000 },
    { kode: 'T006', nama: 'Fish Ball/Bakso', kategori: 'Topping', harga: 3000 },
    { kode: 'T007', nama: 'Sosis/Nugget', kategori: 'Topping', harga: 4000 },
    { kode: 'T008', nama: 'Fish Roll', kategori: 'Topping', harga: 6000 },
    { kode: 'T009', nama: 'Telor Ceplok', kategori: 'Topping', harga: 5000 },
    { kode: 'T010', nama: 'Telor Setengah Matang', kategori: 'Topping', harga: 5000 },
    { kode: 'T011', nama: 'Telor Rebus', kategori: 'Topping', harga: 5000 },
    { kode: 'T012', nama: 'Dumpling Cheese/Chicken', kategori: 'Topping', harga: 6000 },
  ];

  for (const item of daftarMenu) {
    await prisma.menu.create({
      data: item,
    });
  }

  console.log(`✅ Berhasil menambahkan ${daftarMenu.length} menu ke database kasir!`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });