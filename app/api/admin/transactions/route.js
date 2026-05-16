import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Mengambil semua data transaksi, diurutkan dari yang paling baru
    const transactions = await prisma.transaction.findMany({
      orderBy: { timestamp: 'desc' }
    });
    return NextResponse.json(transactions);
  } catch (error) {
    return NextResponse.json({ error: 'Gagal mengambil data laporan' }, { status: 500 });
  }
}