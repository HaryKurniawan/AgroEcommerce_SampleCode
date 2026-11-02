import { Injectable } from "@nestjs/common";
import { PenggunasRepository } from "../repositories/pengguna.repository";

@Injectable()
export class GetPendingB2bRequestsUseCase {
  constructor(private readonly penggunaRepo: PenggunasRepository) {}

  async execute() {
    const pendingRequests = await this.penggunaRepo.findMany({
      where: {
        statusVerifikasiPerusahaan: "PENDING",
        isPerusahaan: true,
      },
      select: {
        id_pengguna: true,
        email: true,
        nama: true,
        noTelepon: true,
        isPerusahaan: true,
        namaPerusahaan: true,
        npwpPerusahaan: true,
        nibPerusahaan: true,
        statusVerifikasiPerusahaan: true,
        createdAt: true,
      },
      orderBy: {
        updatedAt: 'desc',
      }
    });

    return pendingRequests;
  }
}
