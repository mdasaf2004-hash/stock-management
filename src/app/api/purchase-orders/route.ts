import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const purchaseOrderSchema = z.object({
  warehouseId: z.string().uuid(),
  wholesalerId: z.string().uuid(),
  notes: z.string().optional(),
  expectedDate: z.string().optional(),
  items: z.array(
    z.object({
      materialId: z.string().uuid(),
      quantity: z.number().positive(),
      unitPrice: z.number().positive(),
    })
  ).min(1, "At least one item is required"),
});

export async function GET() {
  try {
    const purchaseOrders = await prisma.purchaseOrder.findMany({
      include: {
        wholesaler: true,
        warehouse: true,
        items: { include: { material: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(purchaseOrders);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch purchase orders" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = purchaseOrderSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { warehouseId, wholesalerId, notes, expectedDate, items } = parsed.data;

    const poCount = await prisma.purchaseOrder.count();
    const poNumber = `PO-${String(poCount + 1).padStart(4, "0")}`;

    const purchaseOrder = await prisma.purchaseOrder.create({
      data: {
        poNumber,
        warehouseId,
        wholesalerId,
        notes,
        expectedDate: expectedDate ? new Date(expectedDate) : undefined,
        items: {
          create: items.map((item) => ({
            materialId: item.materialId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
          })),
        },
      },
      include: { items: true },
    });

    return NextResponse.json(purchaseOrder, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create purchase order" }, { status: 500 });
  }
}
