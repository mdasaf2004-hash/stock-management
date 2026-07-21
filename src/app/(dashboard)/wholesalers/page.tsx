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
import { AddWholesalerForm } from "@/components/forms/add-wholesaler-form";
import { WholesalerTableSearch } from "@/components/tables/wholesaler-table";

export const dynamic = "force-dynamic";

export default async function WholesalersPage() {
  const wholesalers = await prisma.wholesaler.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Wholesalers</h1>
          <p className="text-muted-foreground text-sm">
            B2B client management and credit accounts
          </p>
        </div>
        <AddWholesalerForm />
      </div>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <CardTitle className="text-base">Client Registry</CardTitle>
          <WholesalerTableSearch />
        </CardHeader>
        <CardContent>
          <div className="table-responsive rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Contact Person</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead className="text-right">Credit Limit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {wholesalers.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="h-24 text-center text-muted-foreground"
                    >
                      No wholesalers registered yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  wholesalers.map((w) => (
                    <TableRow key={w.id}>
                      <TableCell className="font-medium">{w.name}</TableCell>
                      <TableCell>{w.contactPerson || "—"}</TableCell>
                      <TableCell>{w.email || "—"}</TableCell>
                      <TableCell>{w.phone || "—"}</TableCell>
                      <TableCell className="text-right font-mono">
                        ₹{Number(w.creditLimit).toLocaleString()}
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
