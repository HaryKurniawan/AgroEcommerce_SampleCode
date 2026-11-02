export interface Product {
  id: string;
  nama: string;
  deskripsi: string;
  harga: number;
  satuan: string;
  kategori: string;
  imageUrl?: string;
  farmerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductRequest {
  nama: string;
  deskripsi: string;
  harga: number;
  satuan: string;
  kategori: string;
  imageUrl?: string;
}
