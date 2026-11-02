import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";

import { PesananEcomsRepository } from "../repositories/ecom-pesanans.repository";
import { ProdukEcomsRepository } from "../../ecom-produk/repositories/ecom-produks.repository";
import { PrismaService } from "../../../infrastructure/database/prisma.service";
import { IdGenerator } from "../../utils/id-generator.util";

export interface CreatePesananGrosirDto {
  item: { produkId: string; jumlah: number; harga: number }[];
  catatan?: string;
  alamatKirim?: string;
  diskonGrosirPersen?: number;
  tipePengiriman?: string;
  tanggalPermintaanKirim?: string | Date;
  metodeBayar?: string;
  packagingSpecs?: any[];
}

@Injectable()
export class CreatePesananGrosirUseCase {
  constructor(
    private readonly ordersRepo: PesananEcomsRepository,
    private readonly productsRepo: ProdukEcomsRepository,
    private readonly prisma: PrismaService,
  ) {}

  async execute(penggunaId: string, data: CreatePesananGrosirDto) {
    const { item, catatan, alamatKirim } = data;

    if (!item || item.length === 0) {
      throw new BadRequestException(
        "Pesanan harus memiliki setidaknya satu item",
      );
    }

    const pengguna = await this.prisma.pengguna.findUnique({ where: { id_pengguna: penggunaId },
      select: { noTeleponTerverifikasiPada: true, peran: true }
    });

    const isAdmin = ["SUPER_ADMIN", "ADMIN_CS"].includes(pengguna?.peran || "");
    if (!isAdmin && !pengguna) {
      throw new BadRequestException("Data pengguna tidak ditemukan.");
    }

    let totalJumlah = 0;
    for (const it of item) {
      if (!it.jumlah || it.jumlah <= 0) {
        throw new BadRequestException("Jumlah pesanan tidak valid");
      }
      totalJumlah += it.jumlah;
    }

    // Grosir assumes 1 store per order for simplicity in this implementation
    const produkId = item[0].produkId;
    const produk = await this.productsRepo.findUnique({
      where: { id_produk: produkId },
    });

    if (!produk) {
      throw new NotFoundException(
        `Produk dengan ID ${produkId} tidak ditemukan`,
      );
    }

    const minGrosir = Math.max(100, (produk.stok || 0) + 1);

    if (totalJumlah < minGrosir) {
      throw new BadRequestException(
        `Total keseluruhan pesanan grosir harus minimal ${minGrosir} kg (menyesuaikan sisa stok)`,
      );
    }



    // Location guard: Check if user address is within service area
    if (alamatKirim) {
      const userAddress = await this.prisma.alamatKonsumen.findFirst({
        where: {
          konsumenId: penggunaId,
          alamat: alamatKirim,
        },
      });

      if (userAddress && (!userAddress.lat || !userAddress.lng)) {
        throw new ForbiddenException(
          "Alamat pengiriman tidak memiliki koordinat lokasi. Silakan perbarui alamat Anda.",
        );
      }

      // Check if address is within allowed service area (e.g., Jawa Barat)
      const allowedProvinces = ["Jawa Barat", "Jawa Tengah", "Jawa Timur"];
      if (
        userAddress &&
        userAddress.provinsi &&
        !allowedProvinces.includes(userAddress.provinsi)
      ) {
        throw new ForbiddenException(
          "Pengajuan grosir hanya tersedia untuk area tertentu. Silakan hubungi penjual untuk informasi lebih lanjut.",
        );
      }
    }

    // Fetch config toko untuk ongkosKirimGrosir
    const tokoConfig = await this.prisma.konfigurasiHargaToko.findUnique({
      where: { tokoId: produk.tokoId },
    });
    
    // Gratis ongkir jika pesanan >= 300kg
    const ongkosKirimGrosir = totalJumlah >= 300 ? 0 : (tokoConfig?.ongkosKirimGrosir || 0);

    const subtotal = item.reduce(
      (sum: number, it) => sum + it.harga * it.jumlah,
      0,
    );

    // Hitung diskon
    const diskonPersen = data.diskonGrosirPersen || 0;
    const nominalDiskon = (subtotal * diskonPersen) / 100;
    const totalHarga = subtotal - nominalDiskon + ongkosKirimGrosir;

    // Calculate jadwalKirim based on tipePengiriman
    let jadwalKirim: Date | null = null;
    const tipePengiriman = data.tipePengiriman || "DEFAULT";

    if (tipePengiriman === "CUSTOM") {
      if (!data.tanggalPermintaanKirim) {
        throw new BadRequestException("Tanggal permintaan kirim harus diisi untuk tipe pengiriman CUSTOM");
      }
      jadwalKirim = new Date(data.tanggalPermintaanKirim);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const requestedDate = new Date(jadwalKirim);
      requestedDate.setHours(0, 0, 0, 0);

      const diffTime = requestedDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays < 2) {
        throw new BadRequestException("Tanggal permintaan kirim minimal H+2 dari hari ini");
      }

      // Validasi kapasitas: H+2 = 1 ton (1000kg), H+3 = 2 ton (2000kg), dll
      const maxCapacity = (diffDays - 1) * 1000;
      if (totalJumlah > maxCapacity) {
        throw new BadRequestException(`Tanggal pengiriman (H+${diffDays}) hanya dapat melayani pesanan maksimal ${maxCapacity} kg. Pesanan Anda: ${totalJumlah} kg.`);
      }
    } else {
      jadwalKirim = null; // Akan ditentukan setelah pembayaran berhasil
    }

    // Tambahkan tag PRE-ORDER jika total jumlah > stok produk
    let finalCatatan = catatan ? catatan + ` [TIPE_PENGIRIMAN:${tipePengiriman}]` : `[TIPE_PENGIRIMAN:${tipePengiriman}]`;
    if (totalJumlah > produk.stok) {
      finalCatatan = `[PRE-ORDER/BOOKING] ` + finalCatatan;
    }

    // Create the order with status MENUNGGU_KONFIRMASI_SELLER
    console.log("PACKAGING SPECS RECEIVED:", JSON.stringify(data.packagingSpecs));
    
    const currentOrderCount = await this.prisma.pesananEcom.count({});
    const storeInfo2 = await this.prisma.toko.findUnique({
      where: { id_toko: produk.tokoId },
      select: { kodeToko: true }
    });
    const nomorInvoice = IdGenerator.generateInvoiceNumber(storeInfo2?.kodeToko || "TKO", currentOrderCount + 1);

    const pesanan = await this.ordersRepo.create({
      data: {
        id_pesanan: nomorInvoice,
        konsumenId: penggunaId,
        tokoId: produk.tokoId,
        status: "MENUNGGU_KONFIRMASI_SELLER",
        isGrosir: true,
        ongkir: ongkosKirimGrosir,
        totalHarga,
        metodeBayar: data.metodeBayar || "MANUAL",
        alamatKirim: data.alamatKirim || "Default Address",
        kemasanGrosir: (data.packagingSpecs || []) as any,
        diskonGrosirPersen: diskonPersen,
        diprosesOleh: "TOKO",
        jadwalKirim: jadwalKirim,
        catatan: finalCatatan,
        item: {
          create: item.map((it) => ({
            produkId: it.produkId,
            jumlah: it.jumlah,
            harga: it.harga,
          })),
        },
      },
    });

    return pesanan;
  }
}
