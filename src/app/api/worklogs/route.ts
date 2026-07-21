import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const workLogSchema = z.object({
  employeeId: z.string().uuid(),
  date: z.string().optional(),
  startTime: z.string(),
  endTime: z.string().optional(),
  hoursWorked: z.number().positive(),
  taskType: z.string().min(2, "Task type is required"),
  description: z.string().min(2, "Description is required"),
  quantity: z.number().optional(),
  unit: z.string().optional(),
  status: z.enum(["IN_PROGRESS", "COMPLETED", "ON_HOLD"]).default("COMPLETED"),
  notes: z.string().optional(),
});

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const employeeId = searchParams.get("employeeId");

    const where = employeeId ? { employeeId } : {};

    const workLogs = await prisma.workLog.findMany({
      where,
      include: { employee: true },
      orderBy: { date: "desc" },
    });
    return NextResponse.json(workLogs);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch work logs" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = workLogSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const workLog = await prisma.workLog.create({
      data: {
        ...parsed.data,
        date: parsed.data.date ? new Date(parsed.data.date) : new Date(),
        startTime: new Date(parsed.data.startTime),
        endTime: parsed.data.endTime ? new Date(parsed.data.endTime) : null,
      },
      include: { employee: true },
    });

    return NextResponse.json(workLog, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}