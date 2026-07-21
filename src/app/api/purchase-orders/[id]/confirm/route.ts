import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const purchaseOrder = await prisma.purchaseOrder.findUnique({
    where: { id },
    include: { items: true },
  });

  if (!purchaseOrder) return NextResponse.json({ error: "Purchase order not found" }, { status: 404 });

  try {
    await prisma.$transaction(async (tx) => {
      for (const item of purchaseOrder.items) {
        await tx.stock.upsert({
          where: {
            warehouseId_materialId: {
              warehouseId: purchaseOrder.warehouseId,
              materialId: item.materialId,
            },
          },
          create: {
            warehouseId: purchaseOrder.warehouseId,
            materialId: item.materialId,
            quantity: item.quantity,
          },
          update: {
            quantity: { increment: item.quantity },
          },
        });

        await tx.stockMovement.create({
          data: {
            warehouseId: purchaseOrder.warehouseId,
            materialId: item.materialId,
            type: "INBOUND",
            quantity: item.quantity,
            referenceId: purchaseOrder.id,
            notes: `Purchase Order ${purchaseOrder.poNumber}`,
          },
        });
      }

      await tx.purchaseOrder.update({
        where: { id: purchaseOrder.id },
        data: { status: "CONFIRMED" },
      });
    });

    return NextResponse.json({ ok: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
