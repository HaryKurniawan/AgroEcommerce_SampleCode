import { Injectable, NotFoundException } from "@nestjs/common";
import { PenggunasRepository } from "../repositories/pengguna.repository";
import { VerifyB2bDto } from "../dto/verify-b2b.dto";

@Injectable()
export class VerifyB2bUseCase {
  constructor(private readonly penggunaRepo: PenggunasRepository) {}

  async execute(userId: string, dto: VerifyB2bDto) {
    const user = await this.penggunaRepo.findUnique({
      where: { id_pengguna: userId },
    });

    if (!user) {
      throw new NotFoundException("Pengguna tidak ditemukan");
    }

    if (!user.isPerusahaan) {
      throw new NotFoundException("Pengguna ini tidak mengajukan sebagai perusahaan");
    }

    const updatedUser = await this.penggunaRepo.update({
      where: { id_pengguna: userId },
      data: {
        statusVerifikasiPerusahaan: dto.status,
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
      message: `Status verifikasi perusahaan berhasil diubah menjadi ${dto.status}`,
      data: updatedUser,
    };
  }
}
