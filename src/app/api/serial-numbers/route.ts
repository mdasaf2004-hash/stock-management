import { NextResponse, NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const serialNumberSchema = z.object({
  serialNumber: z.string().min(1, "Serial number is required"),
  materialId: z.string().min(1, "Material ID is required"),
  warehouseId: z.string().min(1, "Warehouse ID is required"),
  batchId: z.string().optional(),
  status: z
    .enum(["AVAILABLE", "ASSIGNED", "RETURNED", "DAMAGED"])
    .default("AVAILABLE"),
});

export async function GET() {
  try {
    const serialNumbers = await prisma.serialNumber.findMany({
      include: {
        material: true,
        warehouse: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(serialNumbers);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch serial numbers" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = serialNumberSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const existing = await prisma.serialNumber.findUnique({
      where: { serialNumber: parsed.data.serialNumber },
    });
    if (existing) {
      return NextResponse.json(
        { error: { fieldErrors: { serialNumber: ["Serial number already exists"] } } },
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

    if (parsed.data.batchId) {
      const batch = await prisma.batch.findUnique({
        where: { id: parsed.data.batchId },
      });
      if (!batch) {
        return NextResponse.json(
          { error: { fieldErrors: { batchId: ["Batch not found"] } } },
          { status: 400 }
        );
      }
    }

    const serialNumber = await prisma.serialNumber.create({
      data: {
        serialNumber: parsed.data.serialNumber,
        materialId: parsed.data.materialId,
        warehouseId: parsed.data.warehouseId,
        status: parsed.data.status,
        batchId: parsed.data.batchId ?? undefined,
      },
    });

    return NextResponse.json(serialNumber, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create serial number" },
      { status: 500 }
    );
  }
}
