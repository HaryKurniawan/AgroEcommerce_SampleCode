import { ApiProperty } from "@nestjs/swagger";
import { StatusVerifikasiPerusahaan } from "@prisma/client";
import { IsEnum, IsNotEmpty } from "class-validator";

export class VerifyB2bDto {
  @ApiProperty({
    description: "Status verifikasi yang akan diubah",
    enum: StatusVerifikasiPerusahaan,
    example: StatusVerifikasiPerusahaan.DISETUJUI,
  })
  @IsEnum(StatusVerifikasiPerusahaan)
  @IsNotEmpty()
  status: StatusVerifikasiPerusahaan;
}
