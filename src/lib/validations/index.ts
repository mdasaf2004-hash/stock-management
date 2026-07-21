import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const warehouseSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  location: z.string().min(2, "Location must be at least 2 characters"),
  address: z.string().optional(),
  contactPerson: z.string().optional(),
  phone: z.string().optional(),
  capacity: z.number().int().positive().optional(),
});

export const materialSchema = z.object({
  sku: z.string().min(3, "SKU must be at least 3 characters"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  category: z.string().min(2, "Category is required"),
  unit: z.string().min(1, "Unit is required"),
  unitPrice: z.number().positive("Price must be positive"),
  reorderLevel: z.number().int().nonnegative().default(0),
  reorderQuantity: z.number().int().nonnegative().default(0),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
  expiryDate: z.string().optional(),
});

export const orderSchema = z.object({
  warehouseId: z.string().uuid(),
  wholesalerId: z.string().uuid(),
  notes: z.string().optional(),
  items: z
    .array(
      z.object({
        materialId: z.string().uuid(),
        quantity: z.number().positive(),
        unitPrice: z.number().positive(),
      })
    )
    .min(1, "At least one item is required"),
});

export const purchaseOrderSchema = z.object({
  warehouseId: z.string().uuid(),
  wholesalerId: z.string().uuid(),
  notes: z.string().optional(),
  expectedDate: z.string().optional(),
  items: z
    .array(
      z.object({
        materialId: z.string().uuid(),
        quantity: z.number().positive(),
        unitPrice: z.number().positive(),
      })
    )
    .min(1, "At least one item is required"),
});

export const stockAdjustmentSchema = z.object({
  warehouseId: z.string().uuid(),
  materialId: z.string().uuid(),
  quantity: z.number(),
  notes: z.string().min(3, "Notes must be at least 3 characters"),
  userId: z.string().optional(),
});

export const batchSchema = z.object({
  batchNumber: z.string().min(1, "Batch number is required"),
  materialId: z.string().uuid(),
  warehouseId: z.string().uuid(),
  quantity: z.number().positive("Quantity must be positive"),
  manufacturingDate: z.string().optional(),
  expiryDate: z.string().optional(),
});

export const serialNumberSchema = z.object({
  serialNumber: z.string().min(1, "Serial number is required"),
  materialId: z.string().uuid(),
  warehouseId: z.string().uuid(),
  batchId: z.string().uuid().optional(),
  status: z.enum(["AVAILABLE", "ASSIGNED", "RETURNED", "DAMAGED"]).default("AVAILABLE"),
});

export const productVariantSchema = z.object({
  name: z.string().min(1, "Variant name is required"),
  sku: z.string().min(3, "SKU must be at least 3 characters"),
  attributes: z.record(z.string(), z.unknown()).optional(),
  unitPrice: z.number().positive("Price must be positive"),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type WarehouseInput = z.infer<typeof warehouseSchema>;
export type MaterialInput = z.infer<typeof materialSchema>;
export type OrderInput = z.infer<typeof orderSchema>;
export type PurchaseOrderInput = z.infer<typeof purchaseOrderSchema>;
export type StockAdjustmentInput = z.infer<typeof stockAdjustmentSchema>;
export type BatchInput = z.infer<typeof batchSchema>;
export type SerialNumberInput = z.infer<typeof serialNumberSchema>;
export type ProductVariantInput = z.infer<typeof productVariantSchema>;
