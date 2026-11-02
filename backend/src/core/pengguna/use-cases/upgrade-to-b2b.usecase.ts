import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { PenggunasRepository } from "../repositories/pengguna.repository";
import { UpgradeB2bDto } from "../dto/upgrade-b2b.dto";

@Injectable()
export class UpgradeToB2bUseCase {
  constructor(private readonly penggunaRepo: PenggunasRepository) {}

  async execute(userId: string, dto: UpgradeB2bDto) {
    const user = await this.penggunaRepo.findUnique({
      where: { id_pengguna: userId },
    });

    if (!user) {
      throw new NotFoundException("Pengguna tidak ditemukan");
    }

    if (user.statusVerifikasiPerusahaan === "PENDING") {
      throw new BadRequestException("Pengajuan B2B sebelumnya masih menunggu verifikasi");
    }

    if (user.statusVerifikasiPerusahaan === "DISETUJUI") {
      throw new BadRequestException("Akun ini sudah diverifikasi sebagai Perusahaan (B2B)");
    }

    const updatedUser = await this.penggunaRepo.update({
      where: { id_pengguna: userId },
      data: {
        isPerusahaan: true,
        namaPerusahaan: dto.namaPerusahaan,
        npwpPerusahaan: dto.npwpPerusahaan,
        nibPerusahaan: dto.nibPerusahaan,
        statusVerifikasiPerusahaan: "PENDING",
      },
      select: {
        id_pengguna: true,
        email: true,
        nama: true,
        isPerusahaan: true,
        namaPerusahaan: true,
        statusVerifikasiPerusahaan: true,
      },
    });

    return {
      message: "Pengajuan upgrade ke akun B2B berhasil dikirim. Menunggu verifikasi admin.",
      data: updatedUser,
    };
  }
}
