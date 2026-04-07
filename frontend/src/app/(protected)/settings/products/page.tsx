"use client";

import { useState, useMemo } from "react";
import { Plus, Package, Trash2, Pencil, Search, ToggleLeft, ToggleRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { EmptyState } from "@/components/ui/empty-state";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  Table,
  TableHeader,
  TableHeaderRow,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { usePageTitle } from "@/hooks/use-page-title";
import { useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct } from "@/hooks/use-products";
import type { Product } from "@/lib/types/products";

export default function ProductsPage() {
  usePageTitle("Products");
  const { data: products, isLoading } = useProducts();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();

  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);

  const filtered = useMemo(() => {
    if (!products) return [];
    if (!search.trim()) return products;
    const q = search.toLowerCase();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q)),
    );
  }, [products, search]);

  const handleSave = () => {
    if (!name.trim()) return;
    if (editId) {
      updateProduct.mutate(
        { id: editId, name: name.trim(), description: description.trim() || undefined },
        { onSuccess: resetForm },
      );
    } else {
      createProduct.mutate(
        { name: name.trim(), description: description.trim() || undefined },
        { onSuccess: resetForm },
      );
    }
  };

  const resetForm = () => {
    setName("");
    setDescription("");
    setEditId(null);
    setShowForm(false);
  };

  const startEdit = (p: Product) => {
    setEditId(p.id);
    setName(p.name);
    setDescription(p.description || "");
    setShowForm(true);
  };

  const toggleStatus = (p: Product) => {
    updateProduct.mutate({
      id: p.id,
      status: p.status === "ACTIVE" ? "INACTIVE" : "ACTIVE",
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-on-surface flex items-center gap-2">
            <Package className="h-6 w-6 text-primary" />
            Products
          </h1>
          <p className="text-[13px] text-on-surface-variant mt-0.5">
            Manage products and assign them to contacts, deals, and sequences
          </p>
        </div>
        <Button onClick={() => { resetForm(); setShowForm(true); }}>
          <Plus className="h-4 w-4 mr-1" /> New Product
        </Button>
      </div>

      {/* Create/Edit Form */}
      {showForm && (
        <div className="p-5 rounded-2xl border border-outline-variant/15 bg-surface-container space-y-3">
          <h3 className="text-[14px] font-semibold text-on-surface">
            {editId ? "Edit Product" : "Create Product"}
          </h3>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Product name *"
            autoFocus
            className="w-full rounded-lg border border-outline-variant/20 bg-surface px-3 py-2.5 text-[13px] text-on-surface focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description (optional)"
            rows={2}
            className="w-full rounded-lg border border-outline-variant/20 bg-surface px-3 py-2.5 text-[13px] text-on-surface focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30 resize-none"
          />
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" size="sm" onClick={resetForm}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={!name.trim() || createProduct.isPending || updateProduct.isPending}
              loading={createProduct.isPending || updateProduct.isPending}
            >
              {editId ? "Update Product" : "Create Product"}
            </Button>
          </div>
        </div>
      )}

      {/* Search */}
      {products && products.length > 0 && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-surface-container border border-outline-variant/10 max-w-sm">
          <Search className="h-4 w-4 text-on-surface-variant/40" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="flex-1 bg-transparent text-[13px] text-on-surface outline-none placeholder:text-on-surface-variant/40"
          />
        </div>
      )}

      {/* Table */}
      {filtered.length > 0 ? (
        <div className="rounded-2xl border border-outline-variant/10 overflow-hidden">
          <Table>
            <TableHeader>
              <TableHeaderRow>
                <TableHead>Product</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableHeaderRow>
            </TableHeader>
            <TableBody>
              {filtered.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <Package className="h-4 w-4 text-primary" />
                      </div>
                      <span className="text-[13px] font-medium text-on-surface">
                        {product.name}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell className="text-[12px] text-on-surface-variant truncate max-w-[250px]">
                    {product.description || "—"}
                  </TableCell>

                  <TableCell>
                    <button onClick={() => toggleStatus(product)} title="Toggle status">
                      <Badge variant={product.status === "ACTIVE" ? "success" : "muted"}>
                        {product.status === "ACTIVE" ? (
                          <ToggleRight className="h-3 w-3 mr-1" />
                        ) : (
                          <ToggleLeft className="h-3 w-3 mr-1" />
                        )}
                        {product.status}
                      </Badge>
                    </button>
                  </TableCell>

                  <TableCell className="text-[12px] text-on-surface-variant">
                    {new Date(product.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => startEdit(product)}
                        className="p-1.5 rounded-lg text-on-surface-variant hover:text-primary hover:bg-primary/10 transition-colors"
                        title="Edit"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(product)}
                        className="p-1.5 rounded-lg text-on-surface-variant hover:text-error hover:bg-error/10 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : products && products.length > 0 && search ? (
        <p className="text-[13px] text-on-surface-variant/50 text-center py-8">
          No products match "{search}"
        </p>
      ) : (
        !showForm && (
          <EmptyState
            icon={Package}
            title="No products yet"
            description="Create products to assign to contacts, deals, chatbot flows, and sequences"
            actionLabel="Create Product"
            onAction={() => { resetForm(); setShowForm(true); }}
          />
        )
      )}

      {/* Delete confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Product"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This will remove it from all contacts and deals.`}
        confirmLabel="Delete"
        variant="danger"
        loading={deleteProduct.isPending}
        onConfirm={() => {
          if (deleteTarget) {
            deleteProduct.mutate(deleteTarget.id, {
              onSuccess: () => setDeleteTarget(null),
            });
          }
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
