import { Injectable } from "@nestjs/common";

import { PesananEcomsRepository } from "../repositories/ecom-pesanans.repository";

@Injectable()
export class SellerFindOrdersUseCase {
  constructor(private readonly ordersRepo: PesananEcomsRepository) {}

  async execute(
    tokoId: string,
    status?: string,
    page = 1,
    limit = 10,
    isGrosir?: boolean,
  ) {
    const skip = (page - 1) * limit;

    const where: any = {
      item: { some: { produk: { tokoId } } },
    };

    if (status) {
      const upperStatus = status.toUpperCase();
      if (upperStatus === "TIBA") {
        where.status = "DIKIRIM";
        where.pengiriman = { status: "ARRIVED" };
      } else if (upperStatus === "DIKIRIM") {
        where.status = "DIKIRIM";
        where.pengiriman = {
          OR: [{ status: { not: "ARRIVED" } }, { status: null }],
        };
      } else if (upperStatus === "SEMUA" || upperStatus === "AKTIF") {
        where.status = { notIn: ["SELESAI", "DIBATALKAN", "DITUTUP"] };
      } else {
        where.status = upperStatus;
      }
    }

    if (isGrosir !== undefined) where.isGrosir = isGrosir;

    const [data, total] = await Promise.all([
      this.ordersRepo.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          konsumen: { select: { nama: true, email: true } },
          item: {
            where: { produk: { tokoId } },
            include: { produk: true, transaksiKeuntungan: true },
          },
          pengiriman: true,
        },
      }),
      this.ordersRepo.count({ where }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }
}

