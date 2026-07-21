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
import { AddMaterialForm } from "@/components/forms/add-material-form";
import { MaterialTableSearch } from "@/components/tables/material-table";
import { MaterialActions } from "@/components/tables/material-table";

export const dynamic = "force-dynamic";

function getExpiryStatus(expiryDate: string | null) {
  if (!expiryDate) return null;
  const now = new Date();
  const expiry = new Date(expiryDate);
  const diffMs = expiry.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return { label: "Expired", variant: "destructive" as const };
  }
  if (diffDays <= 30) {
    return { label: `${diffDays}d left`, variant: "secondary" as const };
  }
  return { label: "OK", variant: "outline" as const };
}

export default async function MaterialsPage() {
  const raw = await prisma.material.findMany({
    orderBy: { sku: "asc" },
  });

  const materials = raw.map((m) => ({
    ...m,
    unitPrice: Number(m.unitPrice),
    expiryDate: m.expiryDate?.toISOString() ?? null,
    createdAt: m.createdAt.toISOString(),
    updatedAt: m.updatedAt.toISOString(),
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Materials</h1>
          <p className="text-muted-foreground text-sm">
            Product master catalog with pricing and replenishment thresholds
          </p>
        </div>
        <AddMaterialForm />
      </div>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <CardTitle className="text-base">SKU Registry</CardTitle>
          <MaterialTableSearch />
        </CardHeader>
        <CardContent>
          <div className="table-responsive rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>SKU</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-center">Image</TableHead>
                  <TableHead className="text-right">Unit Price</TableHead>
                  <TableHead className="text-center">Unit</TableHead>
                  <TableHead className="text-center">Reorder Level</TableHead>
                  <TableHead className="text-center">Reorder Qty</TableHead>
                  <TableHead className="text-center">Expiry</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {materials.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={10}
                      className="h-24 text-center text-muted-foreground"
                    >
                      No materials registered yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  materials.map((m) => {
                    const expiryStatus = getExpiryStatus(m.expiryDate);
                    return (
                      <TableRow key={m.id}>
                        <TableCell className="font-mono font-bold text-sm">
                          {m.sku}
                        </TableCell>
                        <TableCell className="font-medium">{m.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{m.category}</Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          {m.imageUrl ? (
                            <img
                              src={m.imageUrl}
                              alt={m.name}
                              className="mx-auto h-8 w-8 rounded-md object-cover"
                            />
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              —
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          ₹
                          {Number(m.unitPrice).toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                          })}
                        </TableCell>
                        <TableCell className="text-center text-sm text-muted-foreground">
                          {m.unit}
                        </TableCell>
                        <TableCell className="text-center font-bold text-amber-600">
                          {m.reorderLevel}
                        </TableCell>
                        <TableCell className="text-center text-sm text-muted-foreground">
                          {m.reorderQuantity}
                        </TableCell>
                        <TableCell className="text-center">
                          {expiryStatus ? (
                            <Badge variant={expiryStatus.variant}>
                              {expiryStatus.label}
                            </Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              —
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <MaterialActions material={m} />
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
