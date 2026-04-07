"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { productsApi } from "@/lib/api/products";
import type { CreateProductRequest, UpdateProductRequest } from "@/lib/types/products";

export function useProducts() {
  return useQuery({
    queryKey: ["products"],
    queryFn: () => productsApi.list(),
  });
}

export function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateProductRequest) => productsApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["products"] }),
  });
}

export function useUpdateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: UpdateProductRequest & { id: string }) => productsApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["products"] }),
  });
}

export function useDeleteProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => productsApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["products"] }),
  });
}

export function useContactProducts(contactId: string | null) {
  return useQuery({
    queryKey: ["contact-products", contactId],
    queryFn: () => productsApi.getContactProducts(contactId!),
    enabled: !!contactId,
  });
}

export function useAssignProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ contactId, productId }: { contactId: string; productId: string }) =>
      productsApi.assign(contactId, productId),
    onSuccess: (_, { contactId }) => {
      qc.invalidateQueries({ queryKey: ["contact-products", contactId] });
    },
  });
}

export function useUnassignProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ contactId, productId }: { contactId: string; productId: string }) =>
      productsApi.unassign(contactId, productId),
    onSuccess: (_, { contactId }) => {
      qc.invalidateQueries({ queryKey: ["contact-products", contactId] });
    },
  });
}
