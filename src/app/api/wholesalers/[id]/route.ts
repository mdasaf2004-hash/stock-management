import { NextResponse, NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const wholesalerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  contactPerson: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  taxId: z.string().optional(),
  creditLimit: z.number().nonnegative().default(0),
});

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const wholesaler = await prisma.wholesaler.findUnique({
      where: { id },
    });

    if (!wholesaler) {
      return NextResponse.json(
        { error: "Wholesaler not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(wholesaler);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch wholesaler" },
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

    const existing = await prisma.wholesaler.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "Wholesaler not found" },
        { status: 404 }
      );
    }

    const body = await req.json();
    const parsed = wholesalerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const wholesaler = await prisma.wholesaler.update({
      where: { id },
      data: parsed.data,
    });

    return NextResponse.json(wholesaler);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update wholesaler" },
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

    const existing = await prisma.wholesaler.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "Wholesaler not found" },
        { status: 404 }
      );
    }

    await prisma.wholesaler.delete({ where: { id } });

    return NextResponse.json({ message: "Wholesaler deleted successfully" });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete wholesaler" },
      { status: 500 }
    );
  }
}
