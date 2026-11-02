import { Product } from "./product";

export interface Order {
  id: string;
  konsumenId: string;
  items: OrderItem[];
  totalHarga: number;
  status: OrderStatus;
  alamatKirim: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  produkId: string;
  product?: Product;
  jumlah: number;
  harga: number;
}

export enum OrderStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  PROCESSING = "PROCESSING",
  SHIPPED = "SHIPPED",
  DELIVERED = "DELIVERED",
  CANCELLED = "CANCELLED",
}

export interface CreateOrderRequest {
  items: { produkId: string; jumlah: number }[];
  alamatKirim: string;
}
