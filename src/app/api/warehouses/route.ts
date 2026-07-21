import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

// strict data validation rule schema via Zod
const warehouseSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  location: z.string().min(2, "Location must be at least 2 characters"),
  address: z.string().optional(),
  contactPerson: z.string().optional(),
  phone: z.string().optional(),
  capacity: z.number().int().positive().optional(),
});

// 1. GET - Fetch all warehouses with their linked stock
export async function GET() {
  try {
    const warehouses = await prisma.warehouse.findMany({
      include: {
        stock: true,
      },
      orderBy: {
        name: "asc",
      },
    });
    return NextResponse.json(warehouses);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch warehouses" },
      { status: 500 }
    );
  }
}

// 2. POST - Securely create a new warehouse
export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Parse input data against the schema rule set
    const parsed = warehouseSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const warehouse = await prisma.warehouse.create({
      data: parsed.data,
    });

    return NextResponse.json(warehouse, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}