import { Injectable, NotFoundException } from "@nestjs/common";

import { ProdukEcomsRepository } from "../repositories/ecom-produks.repository";
import { PrismaService } from "../../../infrastructure/database/prisma.service";


@Injectable()
export class FindProductByIdUseCase {
  constructor(
    private readonly productsRepo: ProdukEcomsRepository,
    private readonly prisma: PrismaService,
  ) {}

  async execute(id: string) {

    const produk = await this.productsRepo.findUnique({
      where: { id_produk: id },
      include: {
        toko: {
          select: {
            id_toko: true,
            nama: true,
            slug: true,
            kabupaten: true,
            wilayah: true,
            telepon: true,
            fotoUrl: true,
            bannerUrl: true,
            deskripsi: true,
            alamat: true,
            jamOperasional: true,
          },
        },
        kategori: true,
        varian: {
          where: { isActive: true },
          orderBy: { ukuranKg: "asc" },
        },
      },
    });
    if (!produk) throw new NotFoundException("Produk not found");

    // Explicitly ensure tokoId is present (it should be, but let's be safe)
    if (!produk.tokoId && produk.toko) {
      (produk as any).tokoId = produk.toko.id_toko;
    }

    // Calculate product rating and terjual
    const [productRatingAgg, productTerjualAgg] = await Promise.all([
      this.prisma.ulasanProdukEcom.aggregate({
        where: { produkId: id, isHidden: false },
        _avg: { rating: true },
      }),
      this.prisma.itemPesananEcom.aggregate({
        where: { produkId: id },
        _sum: { jumlah: true },
      }),
    ]);

    (produk as any).rating = productRatingAgg._avg.rating ?? 0;
    (produk as any).terjual = productTerjualAgg._sum.jumlah ?? 0;
    (produk as any).id = produk.id_produk;

    // Dynamic sync/ensure VarianKemasan for all packaging sizes present in stock batches
    try {
      const batchAggregates = await this.prisma.stokMasukProduk.groupBy({
        by: ["ukuranKemasanKg"],
        where: {
          produkId: id,
        },
        _sum: {
          jumlahKemasanTersisa: true,
        },
      });

      if (batchAggregates.length > 0) {
        for (const agg of batchAggregates) {
          if (!agg.ukuranKemasanKg) continue;
          const totalKemasan = agg._sum.jumlahKemasanTersisa || 0;
          await this.prisma.varianKemasan.upsert({
            where: {
              produkId_ukuranKg: {
                produkId: id,
                ukuranKg: agg.ukuranKemasanKg,
              },
            },
            create: {
              produkId: id,
              ukuranKg: agg.ukuranKemasanKg,
              stokKemasan: totalKemasan,
              isActive: true,
            },
            update: {
              stokKemasan: totalKemasan,
              isActive: true,
            },
          });
        }
      }

      const allVarians = await this.prisma.varianKemasan.findMany({
        where: { produkId: id, isActive: true },
        orderBy: { ukuranKg: "asc" },
      });

      if (allVarians.length > 0) {
        (produk as any).varian = allVarians.map((v: any) => ({
          ...v,
          id: v.id_varianKemasan,
        }));
      }
    } catch (e) {
      console.error("Error syncing varianKemasan in FindProductByIdUseCase:", e);
    }

    // Calculate store stats if toko is loaded
    if (produk.toko) {
      const [totalProduk, totalPenjualanAgg, ratingAgg] = await Promise.all([
        this.prisma.produkEcom.count({
          where: { tokoId: produk.toko.id_toko },
        }),
        this.prisma.itemPesananEcom.aggregate({
          where: { produk: { tokoId: produk.toko.id_toko } },
          _sum: { jumlah: true },
        }),
        this.prisma.ulasanProdukEcom.aggregate({
          where: { produk: { tokoId: produk.toko.id_toko }, isHidden: false },
          _avg: { rating: true },
        }),
      ]);

      (produk.toko as any).rating = ratingAgg._avg.rating ?? 0;
      (produk.toko as any).totalPenjualan = totalPenjualanAgg._sum.jumlah ?? 0;
      (produk.toko as any).totalProduk = totalProduk;
      (produk.toko as any).foto = produk.toko.fotoUrl;
      (produk.toko as any).banner = produk.toko.bannerUrl;
    }



    return produk;
  }
}
