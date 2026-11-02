import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, Length } from "class-validator";

export class UpgradeB2bDto {
  @ApiProperty({
    description: "Nama perusahaan pemohon",
    example: "PT Agro Jabar Maju",
  })
  @IsString()
  @IsNotEmpty()
  namaPerusahaan: string;

  @ApiProperty({
    description: "NPWP Perusahaan (opsional bisa berupa string kosong jika belum ada validasi ketat, tapi disarankan disi)",
    example: "01.234.567.8-901.234",
  })
  @IsString()
  @IsNotEmpty()
  npwpPerusahaan: string;

  @ApiProperty({
    description: "NIB Perusahaan",
    example: "1234567890123",
  })
  @IsString()
  @IsNotEmpty()
  @Length(13, 13, { message: "NIB harus 13 digit" })
  nibPerusahaan: string;
}
