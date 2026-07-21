import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const shipmentSchema = z.object({
  name: z.string().min(2),
  carrierName: z.string().optional(),
  baseCost: z.number().nonnegative(),
  estimatedDays: z.number().int().positive(),
});

export async function GET() {
  try {
    const methods = await prisma.shipmentMethod.findMany();
    return NextResponse.json(methods);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch shipment methods" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = shipmentSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

    const method = await prisma.shipmentMethod.create({ data: parsed.data });
    return NextResponse.json(method, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create shipment method" }, { status: 500 });
  }
}
