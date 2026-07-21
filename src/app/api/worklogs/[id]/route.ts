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

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const workLog = await prisma.workLog.findUnique({
      where: { id },
      include: { employee: true },
    });

    if (!workLog) {
      return NextResponse.json(
        { error: "Work log not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(workLog);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch work log" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const parsed = workLogSchema.partial().safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const workLog = await prisma.workLog.update({
      where: { id },
      data: {
        ...parsed.data,
        date: parsed.data.date ? new Date(parsed.data.date) : undefined,
        startTime: parsed.data.startTime ? new Date(parsed.data.startTime) : undefined,
        endTime: parsed.data.endTime ? new Date(parsed.data.endTime) : undefined,
      },
      include: { employee: true },
    });

    return NextResponse.json(workLog);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update work log" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.workLog.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Work log deleted" });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete work log" },
      { status: 500 }
    );
  }
}