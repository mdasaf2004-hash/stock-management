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
import { AddPurchaseOrderForm } from "@/components/forms/add-purchase-order-form";

export const dynamic = "force-dynamic";

export default async function PurchaseOrdersPage() {
  const [purchaseOrders, warehouses, wholesalers, materials] = await Promise.all([
    prisma.purchaseOrder.findMany({
      include: {
        wholesaler: true,
        warehouse: true,
        items: { include: { material: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.warehouse.findMany({ orderBy: { name: "asc" } }),
    prisma.wholesaler.findMany({ orderBy: { name: "asc" } }),
    prisma.material.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Purchase Orders</h1>
          <p className="text-muted-foreground text-sm">
            Manage purchase orders to suppliers and wholesalers
          </p>
        </div>
        <AddPurchaseOrderForm
          warehouses={warehouses}
          wholesalers={wholesalers}
          materials={materials.map((m) => ({
            ...m,
            unitPrice: Number(m.unitPrice),
          }))}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Purchase Order History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="table-responsive rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>PO #</TableHead>
                  <TableHead>Wholesaler</TableHead>
                  <TableHead>Warehouse</TableHead>
                  <TableHead className="text-center">Items</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead>Expected Date</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {purchaseOrders.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="h-24 text-center text-muted-foreground"
                    >
                      No purchase orders yet. Create your first purchase order.
                    </TableCell>
                  </TableRow>
                ) : (
                  purchaseOrders.map((po) => {
                    const total = po.items.reduce(
                      (acc, item) =>
                        acc +
                        Number(item.quantity) * Number(item.unitPrice),
                      0
                    );
                    return (
                      <TableRow key={po.id}>
                        <TableCell className="font-mono font-bold">
                          {po.poNumber}
                        </TableCell>
                        <TableCell>{po.wholesaler.name}</TableCell>
                        <TableCell>{po.warehouse.name}</TableCell>
                        <TableCell className="text-center">
                          {po.items.length}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge
                            variant={
                              po.status === "RECEIVED"
                                ? "default"
                                : po.status === "PENDING"
                                ? "secondary"
                                : "outline"
                            }
                          >
                            {po.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {po.expectedDate
                            ? new Date(po.expectedDate).toLocaleDateString()
                            : "—"}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          ₹{total.toLocaleString()}
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
    </div>
  );
}
