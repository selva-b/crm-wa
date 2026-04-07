import apiClient from "./client";
import type { Product, CreateProductRequest, UpdateProductRequest } from "@/lib/types/products";

export const productsApi = {
  list: () =>
    apiClient.get<Product[]>("/products").then((r) => r.data),

  create: (data: CreateProductRequest) =>
    apiClient.post<Product>("/products", data).then((r) => r.data),

  update: (id: string, data: UpdateProductRequest) =>
    apiClient.patch<Product>(`/products/${id}`, data).then((r) => r.data),

  delete: (id: string) =>
    apiClient.delete(`/products/${id}`).then((r) => r.data),

  assign: (contactId: string, productId: string) =>
    apiClient.post("/products/assign", { contactId, productId }).then((r) => r.data),

  unassign: (contactId: string, productId: string) =>
    apiClient.delete("/products/unassign", { data: { contactId, productId } }).then((r) => r.data),

  getContactProducts: (contactId: string) =>
    apiClient.get<Product[]>(`/products/by-contact/${contactId}`).then((r) => r.data),
};
