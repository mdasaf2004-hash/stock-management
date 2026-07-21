import { NextResponse, NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const materialSchema = z.object({
  sku: z.string().min(3, "SKU code must be at least 3 characters"),
  name: z.string().min(2, "Product name must be at least 2 characters"),
  category: z.string().min(2, "Category is required"),
  unit: z.string().min(1, "Unit of measure is required"),
  unitPrice: z.number().positive("Price must be a positive value"),
  reorderLevel: z.number().int().nonnegative().default(0),
  reorderQuantity: z.number().int().nonnegative().default(0),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
});

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const material = await prisma.material.findUnique({
      where: { id },
    });

    if (!material) {
      return NextResponse.json(
        { error: "Material not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(material);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch material" },
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

    const existing = await prisma.material.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "Material not found" },
        { status: 404 }
      );
    }

    const body = await req.json();
    const parsed = materialSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 }
      );
    }

    if (parsed.data.sku !== existing.sku) {
      const duplicate = await prisma.material.findUnique({
        where: { sku: parsed.data.sku },
      });
      if (duplicate) {
        return NextResponse.json(
          { error: { fieldErrors: { sku: ["SKU already exists in catalog"] } } },
          { status: 400 }
        );
      }
    }

    const material = await prisma.material.update({
      where: { id },
      data: parsed.data,
    });

    return NextResponse.json(material);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update material" },
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

    const existing = await prisma.material.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "Material not found" },
        { status: 404 }
      );
    }

    const hasStock = await prisma.stock.findFirst({
      where: { materialId: id, quantity: { gt: 0 } },
    });
    if (hasStock) {
      return NextResponse.json(
        { error: "Cannot delete material with existing stock" },
        { status: 400 }
      );
    }

    await prisma.material.delete({ where: { id } });

    return NextResponse.json({ message: "Material deleted successfully" });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete material" },
      { status: 500 }
    );
  }
}
