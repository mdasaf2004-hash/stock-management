import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const orderSchema = z.object({
  warehouseId: z.string().uuid(),
  wholesalerId: z.string().uuid(),
  notes: z.string().optional(),
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
    const orders = await prisma.order.findMany({
      include: { wholesaler: true, warehouse: true, items: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(orders);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = orderSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { warehouseId, wholesalerId, notes, items } = parsed.data;

    const orderCount = await prisma.order.count();
    const orderNumber = `ORD-${String(orderCount + 1).padStart(4, "0")}`;

    const order = await prisma.order.create({
      data: {
        orderNumber,
        warehouseId,
        wholesalerId,
        notes,
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

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}
