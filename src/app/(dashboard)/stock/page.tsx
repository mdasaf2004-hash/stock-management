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
import { AddStockForm } from "@/components/forms/add-stock-form";
import { AddBatchForm } from "@/components/forms/add-batch-form";
import { StockTableSearch } from "@/components/tables/stock-table";

export const dynamic = "force-dynamic";

export default async function StockPage() {
  const [stockItems, batches] = await Promise.all([
    prisma.stock.findMany({
      include: { warehouse: true, material: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.batch.findMany({
      include: { material: true, warehouse: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const lowStockItems = stockItems.filter(
    (item) => Number(item.quantity) <= item.material.reorderLevel
  );

  // eslint-disable-next-line react-hooks/purity
  const now = Date.now();

  const expiringBatches = batches.filter((b) => {
    if (!b.expiryDate) return false;
    const daysUntil = Math.ceil(
      (new Date(b.expiryDate).getTime() - now) / (1000 * 60 * 60 * 24)
    );
    return daysUntil <= 30 && daysUntil >= 0;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Stock Overview</h1>
          <p className="text-muted-foreground text-sm">
            Monitor inventory levels across all warehouses and materials
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <AddBatchForm />
          <AddStockForm />
        </div>
      </div>

      {lowStockItems.length > 0 && (
        <Card className="border-amber-500/20 bg-amber-500/5">
          <CardHeader>
            <CardTitle className="text-amber-500 text-base">
              ⚠ Low Stock Alerts ({lowStockItems.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-amber-500/80">
              {lowStockItems
                .map(
                  (item) =>
                    `${item.material.name} at ${item.warehouse.name}: ${item.quantity} ${item.material.unit}`
                )
                .join(" · ")}
            </div>
          </CardContent>
        </Card>
      )}

      {expiringBatches.length > 0 && (
        <Card className="border-red-500/20 bg-red-500/5">
          <CardHeader>
            <CardTitle className="text-red-500 text-base">
              ⏰ Expiring Batches ({expiringBatches.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-red-500/80">
              {expiringBatches
                .map((b) => {
                  const days = Math.ceil(
                    (new Date(b.expiryDate!).getTime() - now) /
                      (1000 * 60 * 60 * 24)
                  );
                  return `${b.batchNumber} (${b.material.name}): ${days} days left`;
                })
                .join(" · ")}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <CardTitle className="text-base">Current Stock Levels</CardTitle>
          <StockTableSearch />
        </CardHeader>
        <CardContent>
          <div className="table-responsive rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Warehouse</TableHead>
                  <TableHead>Material</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead className="text-center">Reorder Level</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stockItems.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="h-24 text-center text-muted-foreground"
                    >
                      No stock records found. Add inventory to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  stockItems.map((item) => {
                    const isLow =
                      Number(item.quantity) <= item.material.reorderLevel;
                    return (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">
                          {item.warehouse.name}
                        </TableCell>
                        <TableCell>{item.material.name}</TableCell>
                        <TableCell className="font-mono text-sm">
                          {item.material.sku}
                        </TableCell>
                        <TableCell className="text-right font-mono font-bold">
                          {Number(item.quantity).toLocaleString()}
                        </TableCell>
                        <TableCell>{item.material.unit}</TableCell>
                        <TableCell className="text-center">
                          {item.material.reorderLevel}
                        </TableCell>
                        <TableCell className="text-center">
                          {isLow ? (
                            <Badge variant="destructive">Low</Badge>
                          ) : (
                            <Badge variant="secondary">OK</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {batches.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Batch / Lot Tracking</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="table-responsive rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Batch #</TableHead>
                    <TableHead>Material</TableHead>
                    <TableHead>Warehouse</TableHead>
                    <TableHead className="text-right">Quantity</TableHead>
                    <TableHead>Mfg. Date</TableHead>
                    <TableHead>Expiry Date</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {batches.map((batch) => {
                    const isExpired =
                      batch.expiryDate &&
                      new Date(batch.expiryDate) < new Date();
                    const isExpiring =
                      batch.expiryDate &&
                      !isExpired &&
                      Math.ceil(
                        (new Date(batch.expiryDate).getTime() - now) /
                          (1000 * 60 * 60 * 24)
                      ) <= 30;
                    return (
                      <TableRow key={batch.id}>
                        <TableCell className="font-mono font-bold">
                          {batch.batchNumber}
                        </TableCell>
                        <TableCell>{batch.material.name}</TableCell>
                        <TableCell>{batch.warehouse.name}</TableCell>
                        <TableCell className="text-right font-mono">
                          {Number(batch.quantity).toLocaleString()}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {batch.manufacturingDate
                            ? new Date(
                                batch.manufacturingDate
                              ).toLocaleDateString("en-IN")
                            : "—"}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {batch.expiryDate
                            ? new Date(batch.expiryDate).toLocaleDateString(
                                "en-IN"
                              )
                            : "—"}
                        </TableCell>
                        <TableCell className="text-center">
                          {isExpired ? (
                            <Badge variant="destructive">Expired</Badge>
                          ) : isExpiring ? (
                            <Badge variant="secondary" className="bg-amber-500/10 text-amber-500">
                              Expiring Soon
                            </Badge>
                          ) : (
                            <Badge variant="secondary">OK</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
