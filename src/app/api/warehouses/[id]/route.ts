import { NextResponse, NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const warehouseSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  location: z.string().min(2, "Location must be at least 2 characters"),
  address: z.string().optional(),
  contactPerson: z.string().optional(),
  phone: z.string().optional(),
  capacity: z.number().int().positive().optional(),
});

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const warehouse = await prisma.warehouse.findUnique({
      where: { id },
      include: { stock: true },
    });

    if (!warehouse) {
      return NextResponse.json(
        { error: "Warehouse not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(warehouse);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch warehouse" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const existing = await prisma.warehouse.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "Warehouse not found" },
        { status: 404 }
      );
    }

    const body = await req.json();
    const parsed = warehouseSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const warehouse = await prisma.warehouse.update({
      where: { id },
      data: parsed.data,
    });

    return NextResponse.json(warehouse);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update warehouse" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const existing = await prisma.warehouse.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "Warehouse not found" },
        { status: 404 }
      );
    }

    const hasStock = await prisma.stock.findFirst({
      where: { warehouseId: id, quantity: { gt: 0 } },
    });
    if (hasStock) {
      return NextResponse.json(
        { error: "Cannot delete warehouse with existing stock" },
        { status: 400 }
      );
    }

    await prisma.warehouse.delete({ where: { id } });

    return NextResponse.json({ message: "Warehouse deleted successfully" });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete warehouse" },
      { status: 500 }
    );
  }
}
