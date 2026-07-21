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
import { ArrowDownRight, ArrowUpRight, ArrowLeftRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function StockMovementsPage() {
  const movements = await prisma.stockMovement.findMany({
    include: { material: true, warehouse: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Stock Movements</h1>
        <p className="text-muted-foreground text-sm">
          Complete audit trail of all inventory changes across warehouses
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Movement History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="table-responsive rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10"></TableHead>
                  <TableHead>Material</TableHead>
                  <TableHead>Warehouse</TableHead>
                  <TableHead className="text-center">Type</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead className="text-right">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {movements.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="h-24 text-center text-muted-foreground"
                    >
                      No stock movements recorded yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  movements.map((m) => (
                    <TableRow key={m.id}>
                      <TableCell>
                        <div
                          className={`h-7 w-7 rounded-md flex items-center justify-center ${
                            m.type === "INBOUND"
                              ? "bg-emerald-500/10"
                              : m.type === "OUTBOUND"
                              ? "bg-red-500/10"
                              : "bg-blue-500/10"
                          }`}
                        >
                          {m.type === "INBOUND" ? (
                            <ArrowDownRight className="h-3.5 w-3.5 text-emerald-500" />
                          ) : m.type === "OUTBOUND" ? (
                            <ArrowUpRight className="h-3.5 w-3.5 text-red-500" />
                          ) : (
                            <ArrowLeftRight className="h-3.5 w-3.5 text-blue-500" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {m.material.name}
                        <span className="text-xs text-muted-foreground ml-2">
                          {m.material.sku}
                        </span>
                      </TableCell>
                      <TableCell>{m.warehouse.name}</TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant={
                            m.type === "INBOUND"
                              ? "default"
                              : m.type === "OUTBOUND"
                              ? "destructive"
                              : "secondary"
                          }
                        >
                          {m.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-mono font-bold">
                        {m.type === "INBOUND" ? "+" : m.type === "OUTBOUND" ? "-" : ""}
                        {Number(m.quantity).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {m.referenceId || "—"}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                        {m.notes || "—"}
                      </TableCell>
                      <TableCell className="text-right text-sm text-muted-foreground">
                        {new Date(m.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
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
  );
}
