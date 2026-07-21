import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const employeeSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  position: z.string().min(2, "Position is required"),
  department: z.string().optional(),
  warehouseId: z.string().uuid().optional(),
  hireDate: z.string().optional(),
  isActive: z.boolean().default(true),
});

export async function GET() {
  try {
    const employees = await prisma.employee.findMany({
      include: { warehouse: true, workLogs: true },
      orderBy: { name: "asc" },
    });
    return NextResponse.json(employees);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch employees" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = employeeSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const employee = await prisma.employee.create({
      data: {
        ...parsed.data,
        hireDate: parsed.data.hireDate ? new Date(parsed.data.hireDate) : new Date(),
      },
    });

    return NextResponse.json(employee, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}