import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const stockItems = await prisma.stock.findMany({
      include: { warehouse: true, material: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(stockItems);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch stock" }, { status: 500 });
  }
}
