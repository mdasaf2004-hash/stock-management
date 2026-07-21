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
import { AddOrderForm } from "@/components/forms/add-order-form";
import { OrderTableSearch } from "@/components/tables/order-table";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const [orders, warehouses, wholesalers, materials] = await Promise.all([
    prisma.order.findMany({
      include: { wholesaler: true, warehouse: true, items: true },
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
          <h1 className="text-2xl font-bold tracking-tight">Orders</h1>
          <p className="text-muted-foreground text-sm">
            Sales order history and status tracking
          </p>
        </div>
        <AddOrderForm
          warehouses={warehouses}
          wholesalers={wholesalers}
          materials={materials.map((m) => ({
            ...m,
            unitPrice: Number(m.unitPrice),
          }))}
        />
      </div>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <CardTitle className="text-base">Order History</CardTitle>
          <OrderTableSearch />
        </CardHeader>
        <CardContent>
          <div className="table-responsive rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order #</TableHead>
                  <TableHead>Wholesaler</TableHead>
                  <TableHead>Warehouse</TableHead>
                  <TableHead className="text-center">Items</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="h-24 text-center text-muted-foreground"
                    >
                      No orders placed yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  orders.map((o) => {
                    const total = o.items.reduce(
                      (acc, item) =>
                        acc +
                        Number(item.quantity) * Number(item.unitPrice),
                      0
                    );
                    return (
                      <TableRow key={o.id}>
                        <TableCell className="font-mono font-bold">
                          {o.orderNumber}
                        </TableCell>
                        <TableCell>{o.wholesaler.name}</TableCell>
                        <TableCell>{o.warehouse.name}</TableCell>
                        <TableCell className="text-center">
                          {o.items.length}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge
                            variant={
                              o.status === "CONFIRMED"
                                ? "default"
                                : o.status === "PENDING"
                                ? "secondary"
                                : "outline"
                            }
                          >
                            {o.status}
                          </Badge>
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
