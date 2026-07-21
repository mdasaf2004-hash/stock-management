import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AddWorkLogForm } from "@/components/forms/add-worklog-form";
import { User, Clock, CheckCircle, TrendingUp } from "lucide-react";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function EmployeeInsightsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const employee = await prisma.employee.findUnique({
    where: { id },
    include: {
      warehouse: true,
      workLogs: {
        orderBy: { date: "desc" },
      },
    },
  });

  if (!employee) {
    notFound();
  }

  // Calculate insights
  const totalHours = employee.workLogs.reduce(
    (acc, log) => acc + log.hoursWorked,
    0
  );

  const completedTasks = employee.workLogs.filter(
    (log) => log.status === "COMPLETED"
  ).length;

  const inProgressTasks = employee.workLogs.filter(
    (log) => log.status === "IN_PROGRESS"
  ).length;

  const totalQuantity = employee.workLogs.reduce(
    (acc, log) => acc + (log.quantity || 0),
    0
  );

  // Task type breakdown
  const taskTypeBreakdown = employee.workLogs.reduce(
    (acc, log) => {
      const existing = acc.find((item) => item.taskType === log.taskType);
      if (existing) {
        existing.count += 1;
        existing.hours += log.hoursWorked;
      } else {
        acc.push({
          taskType: log.taskType,
          count: 1,
          hours: log.hoursWorked,
        });
      }
      return acc;
    },
    [] as { taskType: string; count: number; hours: number }[]
  );

  // Recent work logs (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const recentLogs = employee.workLogs.filter(
    (log) => new Date(log.date) >= sevenDaysAgo
  );

  const recentHours = recentLogs.reduce(
    (acc, log) => acc + log.hoursWorked,
    0
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{employee.name}</h1>
          <p className="text-muted-foreground text-sm">
            Employee insights and work history
          </p>
        </div>
        <AddWorkLogForm employeeId={employee.id} />
      </div>

      {/* Employee Info Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
              <User className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold">{employee.name}</h2>
              <p className="text-muted-foreground">{employee.position}</p>
              <div className="flex items-center gap-4 mt-2">
                <span className="text-sm">{employee.email}</span>
                {employee.phone && (
                  <span className="text-sm text-muted-foreground">
                    {employee.phone}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="secondary">
                  {employee.warehouse?.name ?? "Unassigned"}
                </Badge>
                <Badge variant={employee.isActive ? "default" : "destructive"}>
                  {employee.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Hours
            </CardTitle>
            <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <Clock className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold tracking-tight">
              {totalHours.toFixed(1)}
            </div>
            <p className="text-xs text-muted-foreground">
              Across {employee.workLogs.length} work logs
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Completed Tasks
            </CardTitle>
            <div className="h-9 w-9 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <CheckCircle className="h-4 w-4 text-emerald-500" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold tracking-tight text-emerald-500">
              {completedTasks}
            </div>
            <p className="text-xs text-muted-foreground">
              {inProgressTasks} in progress
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Quantity
            </CardTitle>
            <div className="h-9 w-9 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold tracking-tight">
              {totalQuantity.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Items processed
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-transparent" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              This Week
            </CardTitle>
            <div className="h-9 w-9 rounded-lg bg-violet-500/10 flex items-center justify-center">
              <Clock className="h-4 w-4 text-violet-500" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold tracking-tight">
              {recentHours.toFixed(1)}
            </div>
            <p className="text-xs text-muted-foreground">
              Hours in last 7 days
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Task Type Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Task Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          {taskTypeBreakdown.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-4">
              No tasks recorded yet
            </p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {taskTypeBreakdown.map((task) => (
                <div
                  key={task.taskType}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                >
                  <div>
                    <p className="text-sm font-medium">{task.taskType}</p>
                    <p className="text-xs text-muted-foreground">
                      {task.count} tasks
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">{task.hours.toFixed(1)}h</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Work Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Work History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="table-responsive rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Task Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-center">Hours</TableHead>
                  <TableHead className="text-center">Quantity</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employee.workLogs.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="h-24 text-center text-muted-foreground"
                    >
                      No work logs recorded yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  employee.workLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        {new Date(log.date).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{log.taskType}</Badge>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {log.description}
                      </TableCell>
                      <TableCell className="text-center font-bold">
                        {log.hoursWorked}h
                      </TableCell>
                      <TableCell className="text-center">
                        {log.quantity ? `${log.quantity} ${log.unit || ""}` : "—"}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant={
                            log.status === "COMPLETED"
                              ? "default"
                              : log.status === "IN_PROGRESS"
                              ? "secondary"
                              : "destructive"
                          }
                        >
                          {log.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}