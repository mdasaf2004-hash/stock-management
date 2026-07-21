import { NextResponse, NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const batchSchema = z.object({
  batchNumber: z.string().min(1, "Batch number is required"),
  materialId: z.string().min(1, "Material ID is required"),
  warehouseId: z.string().min(1, "Warehouse ID is required"),
  quantity: z.number().positive("Quantity must be a positive value"),
  manufacturingDate: z.string().optional(),
  expiryDate: z.string().optional(),
});

export async function GET() {
  try {
    const batches = await prisma.batch.findMany({
      include: {
        material: true,
        warehouse: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(batches);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch batches" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = batchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const existingBatch = await prisma.batch.findUnique({
      where: { batchNumber: parsed.data.batchNumber },
    });
    if (existingBatch) {
      return NextResponse.json(
        { error: { fieldErrors: { batchNumber: ["Batch number already exists"] } } },
        { status: 400 }
      );
    }

    const material = await prisma.material.findUnique({
      where: { id: parsed.data.materialId },
    });
    if (!material) {
      return NextResponse.json(
        { error: { fieldErrors: { materialId: ["Material not found"] } } },
        { status: 400 }
      );
    }

    const warehouse = await prisma.warehouse.findUnique({
      where: { id: parsed.data.warehouseId },
    });
    if (!warehouse) {
      return NextResponse.json(
        { error: { fieldErrors: { warehouseId: ["Warehouse not found"] } } },
        { status: 400 }
      );
    }

    const batch = await prisma.batch.create({
      data: {
        batchNumber: parsed.data.batchNumber,
        materialId: parsed.data.materialId,
        warehouseId: parsed.data.warehouseId,
        quantity: parsed.data.quantity,
        manufacturingDate: parsed.data.manufacturingDate
          ? new Date(parsed.data.manufacturingDate)
          : undefined,
        expiryDate: parsed.data.expiryDate
          ? new Date(parsed.data.expiryDate)
          : undefined,
      },
    });

    return NextResponse.json(batch, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create batch" },
      { status: 500 }
    );
  }
}
