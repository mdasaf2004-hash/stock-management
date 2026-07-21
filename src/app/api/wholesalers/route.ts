import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const wholesalerSchema = z.object({
  name: z.string().min(2),
  contactPerson: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  taxId: z.string().optional(),
  creditLimit: z.number().nonnegative().default(0),
});

export async function GET() {
  try {
    const wholesalers = await prisma.wholesaler.findMany({ orderBy: { name: "asc" } });
    return NextResponse.json(wholesalers);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch wholesalers" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = wholesalerSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

    const wholesaler = await prisma.wholesaler.create({ data: parsed.data });
    return NextResponse.json(wholesaler, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create wholesaler" }, { status: 500 });
  }
}
