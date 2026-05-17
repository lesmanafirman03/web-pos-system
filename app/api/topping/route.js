import { NextResponse } from 'next/server';
// 💡 PERBAIKAN: Hapus kurung kurawal {} pada import prisma
import prisma from '@/lib/prisma'; 

export async function GET() {
  try {
    // Ambil semua data topping dari database Supabase
    const toppings = await prisma.topping.findMany({
      orderBy: { nama: 'asc' }
    });
    
    return NextResponse.json(toppings, { status: 200 });
  } catch (error) {
    console.error("Error fetching toppings:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data topping" }, 
      { status: 500 }
    );
  }
}