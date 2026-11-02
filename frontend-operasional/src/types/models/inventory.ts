import { Product } from "./product";

export interface Inventory {
  id: string;
  produkId: string;
  product?: Product;
  quantity: number;
  warehouseLocation: string;
  lastRestocked: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateInventoryRequest {
  quantity: number;
  warehouseLocation?: string;
}
