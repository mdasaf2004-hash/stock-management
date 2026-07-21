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
import { AddShipmentMethodForm } from "@/components/forms/add-shipment-form";

export const dynamic = "force-dynamic";

export default async function ShipmentsPage() {
  const methods = await prisma.shipmentMethod.findMany();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Shipments</h1>
          <p className="text-muted-foreground text-sm">
            Carrier configuration and shipping method management
          </p>
        </div>
        <AddShipmentMethodForm />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Shipping Methods</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="table-responsive rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Carrier</TableHead>
                  <TableHead className="text-right">Base Cost</TableHead>
                  <TableHead className="text-center">Est. Days</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {methods.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="h-24 text-center text-muted-foreground"
                    >
                      No shipment methods configured yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  methods.map((m) => (
                    <TableRow key={m.id}>
                      <TableCell className="font-medium">{m.name}</TableCell>
                      <TableCell>{m.carrierName || "—"}</TableCell>
                      <TableCell className="text-right font-mono">
                        ₹{Number(m.baseCost).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-center">
                        {m.estimatedDays} days
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
