import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { PrismaService } from "../../infrastructure/database/prisma.service";
import { NotificationsService } from "../../core/notifikasi/notifikasis.service";
import { EmailService } from "../../common/services/email.service";

@Injectable()
export class MonitorDeliveryScheduler {
  private readonly logger = new Logger(MonitorDeliveryScheduler.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
    private readonly emailService: EmailService,
  ) {}

  // Run every hour
  @Cron(CronExpression.EVERY_HOUR)
  async handleCron() {
    this.logger.debug("Checking for overdue deliveries (> 12 hours)...");

    // 12 hours ago
    const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000);

    try {
      // Find orders that are IN_TRANSIT and the shipping was created/updated > 12h ago
      const overdueShippings = await this.prisma.pengirimanPesananEcom.findMany({
        where: {
          status: "IN_TRANSIT",
          updatedAt: {
            lt: twelveHoursAgo,
          },
        },
        include: {
          pesanan: true,
        },
      });

      if (overdueShippings.length === 0) {
        return;
      }

      this.logger.log(`Found ${overdueShippings.length} overdue deliveries.`);

      for (const shipping of overdueShippings) {
        if (!shipping.kurirPenggunaId) continue;

        // Get Courier info
        const kurir = await this.prisma.pengguna.findUnique({
          where: { id_pengguna: shipping.kurirPenggunaId },
        });

        if (!kurir) continue;

        // Send Push Notification
        await this.notificationsService.create(kurir.id_pengguna, {
          judul: "Pengiriman Terlambat",
          pesan: `Anda memiliki pesanan (${shipping.pesanan.id_pesanan}) yang belum diselesaikan lebih dari 12 jam. Mohon cek pesanan dan segera update bukti pengiriman!`,
          tipe: "TUGAS",
        });

        // Send Email
        if (kurir.email) {
          try {
            await this.emailService.sendEmail(
              kurir.email,
              "Peringatan Keterlambatan Pengiriman",
              `Halo ${kurir.nama || "Kurir"},<br><br>Anda memiliki pesanan (${shipping.pesanan.id_pesanan}) yang belum diselesaikan (status masih Dalam Perjalanan) lebih dari 12 jam.<br><br>Mohon cek pesanan dan segera update bukti pengiriman di aplikasi untuk menyelesaikan tugas Anda.<br><br>Terima kasih.`
            );
            this.logger.log(`Sent overdue email to ${kurir.email} for order ${shipping.pesanan.id_pesanan}`);
          } catch (emailErr) {
            this.logger.error(`Failed to send email to ${kurir.email}: ${emailErr.message}`);
          }
        }
        
        // Update updatedAt so we don't spam them every minute (since it runs every hour, it will trigger again in 12 hours if not completed, or we can just update it now to reset the clock)
        await this.prisma.pengirimanPesananEcom.update({
          where: { id_pengirimanPesanan: shipping.id_pengirimanPesanan },
          data: { updatedAt: new Date() },
        });
      }
    } catch (error) {
      this.logger.error("Failed to process overdue deliveries", error);
    }
  }
}
