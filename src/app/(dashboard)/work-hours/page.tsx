import { prisma } from "@/lib/prisma";
import { WorkHoursReport } from "@/components/work-hours-report";

export const dynamic = "force-dynamic";

interface SerializedEmployee {
  id: string;
  name: string;
  position: string;
  department: string | null;
}

interface SerializedWorkLog {
  id: string;
  employeeId: string;
  date: string;
  startTime: string;
  endTime: string | null;
  hoursWorked: number;
  taskType: string;
  description: string;
  quantity: number | null;
  unit: string | null;
  status: string;
  notes: string | null;
  employee: SerializedEmployee;
}

function serialize<T>(value: T): T {
  return JSON.parse(
    JSON.stringify(value, (_key, val) =>
      typeof val?.toNumber === "function" ? val.toNumber() : val
    )
  );
}

export default async function WorkHoursPage() {
  const [employees, workLogs] = await Promise.all([
    prisma.employee.findMany({
      orderBy: { name: "asc" },
    }),
    prisma.workLog.findMany({
      include: { employee: true },
      orderBy: { date: "desc" },
    }),
  ]);

  return (
    <WorkHoursReport
      employees={serialize(employees) as unknown as SerializedEmployee[]}
      workLogs={serialize(workLogs) as unknown as SerializedWorkLog[]}
    />
  );
}
