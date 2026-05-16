import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

// 1. GET: MEMBACA SEMUA DATA TRANSAKSI UNTUK LAPORAN
export async function GET() {
  try {
    const transactions = await prisma.transaction.findMany({
      orderBy: {
        createdAt: 'desc', // Menampilkan transaksi terbaru di urutan paling atas
      },
    });
    return NextResponse.json(transactions);
  } catch (error) {
    console.error("Error GET Transactions:", error);
    return NextResponse.json(
      { error: 'Gagal mengambil data transaksi' },
      { status: 500 }
    );
  }
}

// 2. POST: MEMBUAT TRANSAKSI BARU (SUDAH DIPERBAIKI)
export async function POST(request) {
  try {
    const body = await request.json();
    const { items, subtotal, pajak, grandTotal } = body;
    
    // Generate nomor struk unik: TRX-YYYYMMDD-Random
    const dateStr = new Date().toISOString().slice(0,10).replace(/-/g,"");
    const randomId = Math.floor(1000 + Math.random() * 9000);
    const receiptNumber = `TRX-${dateStr}-${randomId}`;

    // Validasi & Amankan tipe data Angka (Integer) agar tidak memicu crash di Prisma
    const amanSubtotal = parseInt(subtotal) || 0;
    const amanPajak = parseInt(pajak) || 0;
    const amanGrandTotal = parseInt(grandTotal) || 0;

    const newTx = await prisma.transaction.create({
      data: {
        receiptNumber,
        items: typeof items === 'string' ? items : JSON.stringify(items), // Memastikan berwujud string JSON
        subtotal: amanSubtotal,
        pajak: amanPajak,
        grandTotal: amanGrandTotal
      }
    });

    return NextResponse.json(newTx);
  } catch (error) {
    // Menampilkan log error mendetail di Terminal VS Code Anda untuk debugging
    console.error("❌ ERROR KASIR CRASH:", error);
    
    return NextResponse.json(
      { error: 'Gagal membuat transaksi baru', detail: error.message },
      { status: 500 }
    );
  }
}

// 3. DELETE: MERESET (MENGAPUS) ALL TRANSAKSI KASIR
export async function DELETE() {
  try {
    // Menghapus seluruh baris data di tabel transaction
    await prisma.transaction.deleteMany();
    
    return NextResponse.json(
      { message: 'Semua data laporan penjualan berhasil direset' },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error DELETE Transactions:", error);
    return NextResponse.json(
      { error: 'Gagal mereset data transaksi' },
      { status: 500 }
    );
  }
}