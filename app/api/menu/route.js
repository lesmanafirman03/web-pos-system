import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

// 1. AMBIL SEMUA MENU (Fungsi Lama Anda)
export async function GET() {
  try {
    const menu = await prisma.menu.findMany();
    return NextResponse.json(menu);
  } catch (error) {
    return NextResponse.json({ error: 'Gagal mengambil data menu' }, { status: 500 });
  }
}

// 2. TAMBAH & EDIT MENU (Sudah Diperbarui)
export async function POST(request) {
  try {
    const body = await request.json();
    const { id, kode, nama, kategori, harga } = body;

    // JIKA ADA ID: Artinya pengguna sedang mengedit/memperbarui menu yang sudah ada
    if (id) {
      const updatedMenu = await prisma.menu.update({
        where: { id: parseInt(id) },
        data: { kode, nama, kategori, harga },
      });
      return NextResponse.json(updatedMenu);
    } 
    
    // JIKA TIDAK ADA ID: Artinya membuat menu baru dari awal (Fungsi Lama Anda)
    else {
      const newMenu = await prisma.menu.create({
        data: { kode, nama, kategori, harga },
      });
      return NextResponse.json(newMenu);
    }
  } catch (error) {
    return NextResponse.json({ error: 'Gagal menyimpan data menu' }, { status: 500 });
  }
}

// 3. HAPUS MENU (Fungsi Baru Tambahan)
export async function DELETE(request) {
  try {
    // Mengambil parameter ?id=... dari URL browser
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID menu tidak disertakan' }, { status: 400 });
    }

    await prisma.menu.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ message: 'Menu berhasil dihapus dari database' });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal menghapus menu' }, { status: 500 });
  }
}