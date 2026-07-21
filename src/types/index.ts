export interface User {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "USER" | "WAREHOUSE_STAFF" | "VIEWER";
}

export interface Session {
  user: User;
}

export type OrderStatus = "PENDING" | "CONFIRMED" | "SHIPPED" | "DELIVERED" | "CANCELLED";
export type PurchaseOrderStatus = "PENDING" | "CONFIRMED" | "RECEIVED" | "CANCELLED";
export type StockMovementType = "INBOUND" | "OUTBOUND" | "ADJUSTMENT" | "TRANSFER";
export type SerialNumberStatus = "AVAILABLE" | "ASSIGNED" | "RETURNED" | "DAMAGED";

export interface StockItem {
  id: string;
  warehouseId: string;
  materialId: string;
  quantity: number;
  warehouse: { name: string; location: string };
  material: { name: string; sku: string; unit: string; unitPrice: number; category: string };
}

export interface Batch {
  id: string;
  batchNumber: string;
  materialId: string;
  warehouseId: string;
  quantity: number;
  manufacturingDate?: string;
  expiryDate?: string;
  material: { name: string; sku: string };
  warehouse: { name: string };
}

export interface SerialNumber {
  id: string;
  serialNumber: string;
  materialId: string;
  warehouseId: string;
  batchId?: string;
  status: SerialNumberStatus;
  material: { name: string; sku: string };
  warehouse: { name: string };
}

export interface ActivityLog {
  id: string;
  userId?: string;
  action: string;
  entity: string;
  entityId?: string;
  details?: Record<string, unknown>;
  createdAt: string;
  user?: { name: string; email: string };
}
