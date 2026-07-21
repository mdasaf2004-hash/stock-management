import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

// Schema validation for B2B wholesale material entry
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
  expiryDate: z.string().optional(),
});

// 1. GET - Retrieve full product catalog
export async function GET() {
  try {
    const materials = await prisma.material.findMany({
      orderBy: { sku: "asc" },
    });
    return NextResponse.json(materials);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch materials catalog" },
      { status: 500 }
    );
  }
}

// 2. POST - Insert clean validated item to registry
export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    const parsed = materialSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 }
      );
    }

    // Defensive Check: Prevent duplicate SKU keys
    const existingMaterial = await prisma.material.findUnique({
      where: { sku: parsed.data.sku },
    });
    if (existingMaterial) {
      return NextResponse.json(
        { error: { fieldErrors: { sku: ["SKU already exists in catalog"] } } },
        { status: 400 }
      );
    }

    const material = await prisma.material.create({
      data: parsed.data,
    });

    return NextResponse.json(material, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}