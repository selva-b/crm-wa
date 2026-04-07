export type ProductStatus = "ACTIVE" | "INACTIVE";

export interface Product {
  id: string;
  orgId: string;
  name: string;
  description: string | null;
  status: ProductStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductRequest {
  name: string;
  description?: string;
}

export interface UpdateProductRequest {
  name?: string;
  description?: string;
  status?: ProductStatus;
}
