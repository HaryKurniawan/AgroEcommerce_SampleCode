import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../infrastructure/database/prisma.service";

@Injectable()
export class SellerDashboardStatsUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(tokoId: string) {
    const whereCondition = {
      item: { some: { produk: { tokoId } } },
      isGrosir: false,
    };

    // 1. Get status counts with pengiriman status
    const ordersForStatus = await this.prisma.pesananEcom.findMany({
      where: whereCondition,
      select: {
        status: true,
        pengiriman: { select: { status: true } },
      },
    });

    let totalAktif = 0;
    let belumBayar = 0;
    let diproses = 0;
    let dikirim = 0;
    let tiba = 0;

    const rawStatusMap: Record<string, number> = {};

    ordersForStatus.forEach((curr) => {
      rawStatusMap[curr.status] = (rawStatusMap[curr.status] || 0) + 1;

      const isInactive = ["SELESAI", "DIBATALKAN", "DITUTUP"].includes(
        curr.status,
      );
      if (!isInactive) {
        totalAktif++;
      }

      if (curr.status === "MENUNGGU_BAYAR") {
        belumBayar++;
      } else if (
        curr.status === "DIPROSES" ||
        curr.status === "MENUNGGU_KONFIRMASI_SELLER"
      ) {
        diproses++;
      } else if (curr.status === "DIKIRIM") {
        if (curr.pengiriman?.status === "ARRIVED") {
          tiba++;
        } else {
          dikirim++;
        }
      }
    });

    const statusMap = {
      ...rawStatusMap,
      SEMUA: totalAktif,
      semua: totalAktif,
      MENUNGGU_BAYAR: belumBayar,
      DIPROSES: diproses,
      DIKIRIM: dikirim,
      TIBA: tiba,
    };

    // 2. Get total revenue (only SELESAI and DIKIRIM)
    const revenueAggr = await this.prisma.pesananEcom.aggregate({
      where: {
        ...whereCondition,
        status: { in: ["SELESAI", "DIKIRIM"] },
      },
      _sum: {
        totalHarga: true,
      },
    });

    // 3. 7-day orders trend (for the chart)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentOrders = await this.prisma.pesananEcom.findMany({
      where: {
        ...whereCondition,
        createdAt: { gte: sevenDaysAgo },
      },
      select: { createdAt: true, totalHarga: true, status: true },
    });

    // We also need recently created orders (any status) to show in the "Recent Orders" table
    const latestOrders = await this.prisma.pesananEcom.findMany({
      where: whereCondition,
      orderBy: { createdAt: "desc" },
      take: 4,
      include: {
        konsumen: { select: { nama: true, email: true } },
        item: true,
      },
    });

    return {
      statusCounts: statusMap,
      revenue: Number(revenueAggr._sum.totalHarga || 0),
      recentOrders, // For charts
      latestOrders, // For the recent orders table
      totalOrders: Object.values(rawStatusMap).reduce(
        (a: number, b: number) => a + b,
        0,
      ),
    };
  }
}

