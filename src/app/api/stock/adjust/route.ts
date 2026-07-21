import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const adjustmentSchema = z.object({
  warehouseId: z.string().uuid("Invalid warehouse ID"),
  materialId: z.string().uuid("Invalid material ID"),
  quantity: z.number(),
  notes: z.string().min(3, "Please provide a valid reason or note for this manual adjustment"),
  userId: z.string().optional(),
});

export async function POST(req: Request) {
  let parsed;
  try {
    const body = await req.json();
    parsed = adjustmentSchema.safeParse(body);
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { warehouseId, materialId, quantity, notes, userId } = parsed.data;

  try {
    const result = await prisma.$transaction(async (tx) => {
      const stock = await tx.stock.upsert({
        where: {
          warehouseId_materialId: { warehouseId, materialId },
        },
        update: {
          quantity: { increment: quantity },
        },
        create: {
          warehouseId,
          materialId,
          quantity,
        },
      });

      if (Number(stock.quantity) < 0) {
        throw new Error("Inventory adjustment would result in a negative stock balance");
      }

      const movement = await tx.stockMovement.create({
        data: {
          warehouseId,
          materialId,
          type: "ADJUSTMENT",
          quantity: Math.abs(quantity),
          notes: `${quantity >= 0 ? "Manual Add" : "Manual Deduct"} - ${notes}`,
          createdById: userId || null,
        },
      });

      return { stock, movement };
    });

    return NextResponse.json({ success: true, data: result }, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server stock error encountered";
    const status = message.includes("negative stock") ? 400 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
