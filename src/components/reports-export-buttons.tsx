"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

function downloadCsv(filename: string, headers: string[], rows: string[][]) {
  const csvContent = [
    headers.join(","),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
  ].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function StockValuationExport({
  categoryBreakdown,
  totalStockValue,
}: {
  categoryBreakdown: { category: string; totalQuantity: number; totalValue: number }[];
  totalStockValue: number;
}) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => {
        const headers = ["Category", "Total Quantity", "Total Value"];
        const rows = categoryBreakdown.map((c) => [
          c.category,
          c.totalQuantity.toLocaleString(),
          `₹${c.totalValue.toLocaleString()}`,
        ]);
        rows.push(["Grand Total", "", `₹${totalStockValue.toLocaleString()}`]);
        downloadCsv("stock-valuation.csv", headers, rows);
      }}
    >
      <Download className="h-3.5 w-3.5 mr-1" />
      Export CSV
    </Button>
  );
}

export function LowStockExport({
  lowStockItems,
}: {
  lowStockItems: {
    material: { name: string; reorderLevel: number; reorderQuantity: number };
    warehouse: { name: string };
    quantity: number | { toString(): string };
  }[];
}) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => {
        const headers = [
          "Material",
          "Warehouse",
          "Current Qty",
          "Reorder Level",
          "Suggested Reorder Qty",
        ];
        const rows = lowStockItems.map((item) => [
          item.material.name,
          item.warehouse.name,
          Number(item.quantity).toLocaleString(),
          String(item.material.reorderLevel),
          String(item.material.reorderQuantity),
        ]);
        downloadCsv("low-stock-alerts.csv", headers, rows);
      }}
    >
      <Download className="h-3.5 w-3.5 mr-1" />
      Export CSV
    </Button>
  );
}

export function ExpiringItemsExport({
  materialExpiring,
  batchExpiring,
  stockItems,
  now,
}: {
  materialExpiring: { id: string; name: string; expiryDate: Date | string | null }[];
  batchExpiring: {
    id: string;
    batchNumber: string;
    material: { name: string };
    quantity: number | { toString(): string };
    expiryDate: Date | string | null;
  }[];
  stockItems: { materialId: string; quantity: number | { toString(): string } }[];
  now: Date;
}) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => {
        const headers = ["Item", "Batch", "Expiry Date", "Quantity", "Days Until Expiry"];
        const allExpiring = [
          ...materialExpiring
            .filter((m) => m.expiryDate !== null)
            .map((m) => {
              const expiryDate = new Date(m.expiryDate!);
              const daysUntil = Math.ceil(
                (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
              );
              const stockForMaterial = stockItems.filter((s) => s.materialId === m.id);
              const totalQty = stockForMaterial.reduce(
                (acc, s) => acc + Number(s.quantity),
                0
              );
              return {
                item: m.name,
                batch: "All",
                expiryDate: expiryDate.toLocaleDateString("en-IN"),
                quantity: totalQty.toLocaleString(),
                daysUntil,
              };
            }),
          ...batchExpiring
            .filter((b) => b.expiryDate !== null)
            .map((b) => {
              const expiryDate = new Date(b.expiryDate!);
              const daysUntil = Math.ceil(
                (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
              );
              return {
                item: b.material.name,
                batch: b.batchNumber,
                expiryDate: expiryDate.toLocaleDateString("en-IN"),
                quantity: Number(b.quantity).toLocaleString(),
                daysUntil,
              };
            }),
        ];
        const rows = allExpiring.map((e) => [
          e.item,
          e.batch,
          e.expiryDate,
          e.quantity,
          String(e.daysUntil),
        ]);
        downloadCsv("expiring-items.csv", headers, rows);
      }}
    >
      <Download className="h-3.5 w-3.5 mr-1" />
      Export CSV
    </Button>
  );
}

export function DeadStockExport({
  deadStockWithStock,
}: {
  deadStockWithStock: {
    name: string;
    sku: string;
    currentStock: number | { toString(): string };
    lastMovementDate: Date | string | null;
  }[];
}) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => {
        const headers = ["Material", "SKU", "Current Stock", "Last Movement"];
        const rows = deadStockWithStock.map((m) => [
          m.name,
          m.sku,
          m.currentStock.toLocaleString(),
          m.lastMovementDate
            ? new Date(m.lastMovementDate).toLocaleDateString("en-IN")
            : "Never",
        ]);
        downloadCsv("dead-stock.csv", headers, rows);
      }}
    >
      <Download className="h-3.5 w-3.5 mr-1" />
      Export CSV
    </Button>
  );
}