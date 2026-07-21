import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  IndianRupee,
  AlertTriangle,
  Clock,
  PackageX,
} from "lucide-react";
import {
  StockValuationExport,
  LowStockExport,
  ExpiringItemsExport,
  DeadStockExport,
} from "@/components/reports-export-buttons";

export const dynamic = "force-dynamic";

function serialize<T>(value: T): T {
  return JSON.parse(JSON.stringify(value, (_key, val) =>
    typeof val?.toNumber === "function" ? val.toNumber() : val
  ));
}

export default async function ReportsPage() {
  const [stockItems, purchaseOrders, movements, materials, batches, allMovements] =
    await Promise.all([
      prisma.stock.findMany({
        include: { material: true, warehouse: true },
      }),
      prisma.purchaseOrder.findMany({
        include: { items: true, warehouse: true, wholesaler: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.stockMovement.findMany({
        include: { material: true, warehouse: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.material.findMany({
        orderBy: { name: "asc" },
      }),
      prisma.batch.findMany({
        include: { material: true, warehouse: true },
        orderBy: { expiryDate: "asc" },
      }),
      prisma.stockMovement.findMany({
        select: { materialId: true, createdAt: true },
        orderBy: { createdAt: "desc" },
      }),
    ]);

  const totalStockValue = stockItems.reduce(
    (acc, item) => acc + Number(item.quantity) * Number(item.material.unitPrice),
    0
  );

  const categoryBreakdown = stockItems.reduce(
    (acc, item) => {
      const cat = item.material.category;
      const existing = acc.find((c) => c.category === cat);
      if (existing) {
        existing.totalQuantity += Number(item.quantity);
        existing.totalValue += Number(item.quantity) * Number(item.material.unitPrice);
      } else {
        acc.push({
          category: cat,
          totalQuantity: Number(item.quantity),
          totalValue: Number(item.quantity) * Number(item.material.unitPrice),
        });
      }
      return acc;
    },
    [] as { category: string; totalQuantity: number; totalValue: number }[]
  );

  const lowStockItems = stockItems.filter(
    (item) => Number(item.quantity) <= item.material.reorderLevel
  );

  const now = new Date();
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  const materialExpiring = materials.filter((m) => {
    if (!m.expiryDate) return false;
    const expiry = new Date(m.expiryDate);
    return expiry <= thirtyDaysFromNow;
  });

  const batchExpiring = batches.filter((b) => {
    if (!b.expiryDate) return false;
    const expiry = new Date(b.expiryDate);
    return expiry <= thirtyDaysFromNow;
  });

  const recentMovementMaterialIds = new Set(
    allMovements
      .filter(
        (m) => new Date(m.createdAt) >= new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
      )
      .map((m) => m.materialId)
  );

  const deadStockMaterials = materials.filter(
    (m) => !recentMovementMaterialIds.has(m.id)
  );

  const deadStockWithStock = deadStockMaterials.map((m) => {
    const stockForMaterial = stockItems.filter((s) => s.materialId === m.id);
    const totalQty = stockForMaterial.reduce(
      (acc, s) => acc + Number(s.quantity),
      0
    );
    const lastMovement = movements.find((mov) => mov.materialId === m.id);
    return {
      ...m,
      currentStock: totalQty,
      lastMovementDate: lastMovement?.createdAt ?? null,
    };
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Reports & Analytics</h1>
        <p className="text-muted-foreground text-sm">
          Inventory valuation, alerts, and stock health insights
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Stock Valuation */}
        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
            <CardTitle className="text-base flex items-center gap-2">
              <IndianRupee className="h-4 w-4 text-primary" />
              Stock Valuation
            </CardTitle>
            <StockValuationExport
              categoryBreakdown={categoryBreakdown}
              totalStockValue={totalStockValue}
            />
          </CardHeader>
          <CardContent className="relative space-y-4">
            <div className="rounded-lg bg-primary/5 p-4">
              <p className="text-sm text-muted-foreground">Total Inventory Value</p>
              <p className="text-3xl font-bold tracking-tight">
                ₹{totalStockValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </p>
            </div>
            <div className="table-responsive rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Total Quantity</TableHead>
                    <TableHead className="text-right">Total Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categoryBreakdown.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={3}
                        className="h-16 text-center text-muted-foreground"
                      >
                        No stock data available.
                      </TableCell>
                    </TableRow>
                  ) : (
                    categoryBreakdown.map((c) => (
                      <TableRow key={c.category}>
                        <TableCell>
                          <Badge variant="outline">{c.category}</Badge>
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {c.totalQuantity.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          ₹{c.totalValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Low Stock Alerts */}
        <Card className="relative overflow-hidden border-amber-500/20">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
            <CardTitle className="text-base flex items-center gap-2 text-amber-500">
              <AlertTriangle className="h-4 w-4" />
              Low Stock Alerts ({lowStockItems.length})
            </CardTitle>
            <LowStockExport lowStockItems={serialize(lowStockItems)} />
          </CardHeader>
          <CardContent className="relative">
            <div className="table-responsive rounded-md border border-amber-500/20">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Material</TableHead>
                    <TableHead>Warehouse</TableHead>
                    <TableHead className="text-right">Current Qty</TableHead>
                    <TableHead className="text-right">Reorder Level</TableHead>
                    <TableHead className="text-right">Suggested Reorder</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lowStockItems.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="h-16 text-center text-muted-foreground"
                      >
                        All items are adequately stocked.
                      </TableCell>
                    </TableRow>
                  ) : (
                    lowStockItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">
                          {item.material.name}
                          <span className="text-xs text-muted-foreground ml-2">
                            {item.material.sku}
                          </span>
                        </TableCell>
                        <TableCell>{item.warehouse.name}</TableCell>
                        <TableCell className="text-right font-mono font-bold text-amber-500">
                          {Number(item.quantity).toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {item.material.reorderLevel}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {item.material.reorderQuantity}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Expiring Items */}
        <Card className="relative overflow-hidden border-red-500/20">
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
            <CardTitle className="text-base flex items-center gap-2 text-red-500">
              <Clock className="h-4 w-4" />
              Expiring Items
            </CardTitle>
            <ExpiringItemsExport
              materialExpiring={serialize(materialExpiring)}
              batchExpiring={serialize(batchExpiring)}
              stockItems={serialize(stockItems)}
              now={now}
            />
          </CardHeader>
          <CardContent className="relative">
            <div className="table-responsive rounded-md border border-red-500/20">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Batch</TableHead>
                    <TableHead>Expiry Date</TableHead>
                    <TableHead className="text-right">Quantity</TableHead>
                    <TableHead className="text-right">Days Until Expiry</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {materialExpiring.length === 0 && batchExpiring.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="h-16 text-center text-muted-foreground"
                      >
                        No items expiring within the next 30 days.
                      </TableCell>
                    </TableRow>
                  ) : (
                    <>
                      {materialExpiring.map((m) => {
                        const daysUntil = Math.ceil(
                          (new Date(m.expiryDate!).getTime() - now.getTime()) /
                            (1000 * 60 * 60 * 24)
                        );
                        const stockForMaterial = stockItems.filter(
                          (s) => s.materialId === m.id
                        );
                        const totalQty = stockForMaterial.reduce(
                          (acc, s) => acc + Number(s.quantity),
                          0
                        );
                        return (
                          <TableRow key={`mat-${m.id}`}>
                            <TableCell className="font-medium">{m.name}</TableCell>
                            <TableCell className="text-muted-foreground">All</TableCell>
                            <TableCell>
                              {new Date(m.expiryDate!).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </TableCell>
                            <TableCell className="text-right font-mono">
                              {totalQty.toLocaleString()}
                            </TableCell>
                            <TableCell className="text-right">
                              <Badge
                                variant={
                                  daysUntil <= 7 ? "destructive" : "secondary"
                                }
                              >
                                {daysUntil} days
                              </Badge>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                      {batchExpiring.map((b) => {
                        const daysUntil = Math.ceil(
                          (new Date(b.expiryDate!).getTime() - now.getTime()) /
                            (1000 * 60 * 60 * 24)
                        );
                        return (
                          <TableRow key={`batch-${b.id}`}>
                            <TableCell className="font-medium">
                              {b.material.name}
                            </TableCell>
                            <TableCell className="font-mono text-sm">
                              {b.batchNumber}
                            </TableCell>
                            <TableCell>
                              {new Date(b.expiryDate!).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </TableCell>
                            <TableCell className="text-right font-mono">
                              {Number(b.quantity).toLocaleString()}
                            </TableCell>
                            <TableCell className="text-right">
                              <Badge
                                variant={
                                  daysUntil <= 7 ? "destructive" : "secondary"
                                }
                              >
                                {daysUntil} days
                              </Badge>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Dead Stock */}
        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-500/5 to-transparent" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
            <CardTitle className="text-base flex items-center gap-2 text-slate-500">
              <PackageX className="h-4 w-4" />
              Dead Stock ({deadStockWithStock.length})
            </CardTitle>
            <DeadStockExport deadStockWithStock={serialize(deadStockWithStock)} />
          </CardHeader>
          <CardContent className="relative">
            <div className="table-responsive rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Material</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead className="text-right">Current Stock</TableHead>
                    <TableHead>Last Movement</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {deadStockWithStock.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="h-16 text-center text-muted-foreground"
                      >
                        All materials have had recent movement.
                      </TableCell>
                    </TableRow>
                  ) : (
                    deadStockWithStock.map((m) => (
                      <TableRow key={m.id}>
                        <TableCell className="font-medium">{m.name}</TableCell>
                        <TableCell className="font-mono text-sm text-muted-foreground">
                          {m.sku}
                        </TableCell>
                        <TableCell className="text-right font-mono font-bold">
                          {m.currentStock.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {m.lastMovementDate
                            ? new Date(m.lastMovementDate).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })
                            : "No movements recorded"}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
