import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true },
  });

  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  try {
    await prisma.$transaction(async (tx) => {
      // 1. Process each item in the order
      for (const item of order.items) {
        const stock = await tx.stock.findUnique({
          where: {
            warehouseId_materialId: {
              warehouseId: order.warehouseId,
              materialId: item.materialId,
            },
          },
        });

        // 2. Validate sufficient inventory
        if (!stock || Number(stock.quantity) < Number(item.quantity)) {
          throw new Error("Insufficient stock for one or more items");
        }

        // 3. Deduct stock
        await tx.stock.update({
          where: { id: stock.id },
          data: { quantity: { decrement: item.quantity } },
        });

        // 4. Create Audit Trail
        await tx.stockMovement.create({
          data: {
            warehouseId: order.warehouseId,
            materialId: item.materialId,
            type: "OUTBOUND",
            quantity: item.quantity,
            referenceId: order.id,
            notes: `Order ${order.orderNumber}`,
          },
        });
      }

      // 5. Update order status
      await tx.order.update({
        where: { id: order.id },
        data: { status: "CONFIRMED" },
      });
    });

    return NextResponse.json({ ok: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
