"use client";

import { useState, useMemo } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Clock,
  CalendarDays,
  ListChecks,
  TrendingUp,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  LineChart,
  Line,
  Legend,
} from "recharts";

interface Employee {
  id: string;
  name: string;
  position: string;
  department: string | null;
}

interface WorkLog {
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
  employee: Employee;
}

const BAR_COLORS = [
  "oklch(0.623 0.265 262.881)",
  "oklch(0.696 0.215 153.582)",
  "oklch(0.769 0.188 70.08)",
  "oklch(0.828 0.18 25.463)",
  "oklch(0.623 0.265 290)",
  "oklch(0.7 0.2 200)",
  "oklch(0.65 0.25 340)",
  "oklch(0.75 0.15 120)",
];

const PIE_COLORS = [
  "oklch(0.623 0.265 262.881)",
  "oklch(0.696 0.215 153.582)",
  "oklch(0.769 0.188 70.08)",
  "oklch(0.828 0.18 25.463)",
  "oklch(0.623 0.265 290)",
  "oklch(0.7 0.2 200)",
];

function startOfDay(d: Date) {
  const r = new Date(d);
  r.setHours(0, 0, 0, 0);
  return r;
}

function formatDate(d: Date) {
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatTime(d: Date) {
  return d.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export function WorkHoursReport({
  employees,
  workLogs,
}: {
  employees: Employee[];
  workLogs: WorkLog[];
}) {
  const [selectedEmployee, setSelectedEmployee] = useState<string>("all");
  const [dateRange, setDateRange] = useState<string>("30");

  const filteredLogs = useMemo(() => {
    const now = new Date();
    let cutoff: Date;
    switch (dateRange) {
      case "7":
        cutoff = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "90":
        cutoff = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case "all":
        cutoff = new Date(0);
        break;
      default:
        cutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }
    return workLogs.filter((log) => {
      const logDate = new Date(log.date);
      if (logDate < cutoff) return false;
      if (selectedEmployee !== "all" && log.employeeId !== selectedEmployee)
        return false;
      return true;
    });
  }, [workLogs, selectedEmployee, dateRange]);

  const totalHours = useMemo(
    () => filteredLogs.reduce((acc, log) => acc + log.hoursWorked, 0),
    [filteredLogs]
  );

  const totalTasks = filteredLogs.length;

  const avgHoursPerDay = useMemo(() => {
    if (filteredLogs.length === 0) return 0;
    const uniqueDays = new Set(
      filteredLogs.map((log) => startOfDay(new Date(log.date)).toISOString())
    ).size;
    return uniqueDays > 0 ? totalHours / uniqueDays : 0;
  }, [filteredLogs, totalHours]);

  const mostCommonTask = useMemo(() => {
    if (filteredLogs.length === 0) return "—";
    const counts = filteredLogs.reduce(
      (acc, log) => {
        acc[log.taskType] = (acc[log.taskType] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
  }, [filteredLogs]);

  const dailyHoursData = useMemo(() => {
    const map = new Map<string, number>();
    filteredLogs.forEach((log) => {
      const key = startOfDay(new Date(log.date)).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
      });
      map.set(key, (map.get(key) || 0) + log.hoursWorked);
    });
    return Array.from(map.entries())
      .map(([date, hours]) => ({ date, hours: Number(hours.toFixed(1)) }))
      .reverse();
  }, [filteredLogs]);

  const taskTypeData = useMemo(() => {
    const map = new Map<string, number>();
    filteredLogs.forEach((log) => {
      map.set(log.taskType, (map.get(log.taskType) || 0) + log.hoursWorked);
    });
    return Array.from(map.entries())
      .map(([name, value]) => ({
        name,
        value: Number(value.toFixed(1)),
      }))
      .sort((a, b) => b.value - a.value);
  }, [filteredLogs]);

  const weeklyTrendData = useMemo(() => {
    const map = new Map<string, { hours: number; tasks: number }>();
    filteredLogs.forEach((log) => {
      const d = new Date(log.date);
      const dayOfWeek = d.getDay();
      const monday = new Date(d);
      monday.setDate(d.getDate() - ((dayOfWeek + 6) % 7));
      const key = monday.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
      });
      const existing = map.get(key) || { hours: 0, tasks: 0 };
      existing.hours += log.hoursWorked;
      existing.tasks += 1;
      map.set(key, existing);
    });
    return Array.from(map.entries())
      .map(([week, data]) => ({
        week,
        hours: Number(data.hours.toFixed(1)),
        tasks: data.tasks,
      }))
      .reverse();
  }, [filteredLogs]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Work Hours</h1>
          <p className="text-muted-foreground text-sm">
            Employee work hours overview and analytics
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedEmployee} onValueChange={(v) => setSelectedEmployee(v ?? "all")}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Employees" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Employees</SelectItem>
              {employees.map((emp) => (
                <SelectItem key={emp.id} value={emp.id}>
                  {emp.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={dateRange} onValueChange={(v) => setDateRange(v ?? "30")}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

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
              Across {filteredLogs.length} logs
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg Hours / Day
            </CardTitle>
            <div className="h-9 w-9 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <CalendarDays className="h-4 w-4 text-emerald-500" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold tracking-tight text-emerald-500">
              {avgHoursPerDay.toFixed(1)}
            </div>
            <p className="text-xs text-muted-foreground">Daily average</p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Tasks
            </CardTitle>
            <div className="h-9 w-9 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <ListChecks className="h-4 w-4 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold tracking-tight">
              {totalTasks}
            </div>
            <p className="text-xs text-muted-foreground">Tasks logged</p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-transparent" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Top Task
            </CardTitle>
            <div className="h-9 w-9 rounded-lg bg-violet-500/10 flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-violet-500" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-2xl font-bold tracking-tight truncate">
              {mostCommonTask}
            </div>
            <p className="text-xs text-muted-foreground">Most frequent</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Hours Per Day Bar Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Hours Per Day</CardTitle>
          </CardHeader>
          <CardContent>
            {dailyHoursData.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-12">
                No data for selected period
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={dailyHoursData}
                  margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="oklch(1 0 0 / 6%)"
                  />
                  <XAxis
                    dataKey="date"
                    tick={{
                      fill: "oklch(0.708 0 0)",
                      fontSize: 11,
                    }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tick={{
                      fill: "oklch(0.708 0 0)",
                      fontSize: 12,
                    }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `${v}h`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "oklch(0.175 0.01 262)",
                      border: "1px solid oklch(1 0 0 / 8%)",
                      borderRadius: "8px",
                      color: "oklch(0.985 0 0)",
                      fontSize: "13px",
                    }}
                    formatter={(value) => [`${value}h`, "Hours"]}
                  />
                  <Bar dataKey="hours" radius={[4, 4, 0, 0]}>
                    {dailyHoursData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={BAR_COLORS[index % BAR_COLORS.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Task Type Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">By Task Type</CardTitle>
          </CardHeader>
          <CardContent>
            {taskTypeData.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-12">
                No data for selected period
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={taskTypeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                    nameKey="name"
                  >
                    {taskTypeData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={PIE_COLORS[index % PIE_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "oklch(0.175 0.01 262)",
                      border: "1px solid oklch(1 0 0 / 8%)",
                      borderRadius: "8px",
                      color: "oklch(0.985 0 0)",
                      fontSize: "13px",
                    }}
                    formatter={(value) => [`${value}h`, "Hours"]}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: "12px", color: "oklch(0.708 0 0)" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Weekly Trend Line Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Weekly Trend</CardTitle>
        </CardHeader>
        <CardContent>
          {weeklyTrendData.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-12">
              No data for selected period
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart
                data={weeklyTrendData}
                margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="oklch(1 0 0 / 6%)"
                />
                <XAxis
                  dataKey="week"
                  tick={{
                    fill: "oklch(0.708 0 0)",
                    fontSize: 12,
                  }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{
                    fill: "oklch(0.708 0 0)",
                    fontSize: 12,
                  }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `${v}h`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "oklch(0.175 0.01 262)",
                    border: "1px solid oklch(1 0 0 / 8%)",
                    borderRadius: "8px",
                    color: "oklch(0.985 0 0)",
                    fontSize: "13px",
                  }}
                  formatter={(value, name) => [
                    `${value}${name === "hours" ? "h" : ""}`,
                    name === "hours" ? "Hours" : "Tasks",
                  ]}
                />
                <Line
                  type="monotone"
                  dataKey="hours"
                  stroke="oklch(0.623 0.265 262.881)"
                  strokeWidth={2}
                  dot={{ fill: "oklch(0.623 0.265 262.881)", r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="tasks"
                  stroke="oklch(0.696 0.215 153.582)"
                  strokeWidth={2}
                  dot={{ fill: "oklch(0.696 0.215 153.582)", r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Legend
                  wrapperStyle={{ fontSize: "12px", color: "oklch(0.708 0 0)" }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Work Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Work Log Details ({filteredLogs.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Task Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-center">Hours</TableHead>
                  <TableHead className="text-center">Quantity</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="h-24 text-center text-muted-foreground"
                    >
                      No work logs found for the selected filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLogs.map((log) => {
                    const start = new Date(log.startTime);
                    const end = log.endTime ? new Date(log.endTime) : null;
                    return (
                      <TableRow key={log.id}>
                        <TableCell className="font-medium">
                          {log.employee.name}
                        </TableCell>
                        <TableCell>
                          {formatDate(new Date(log.date))}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatTime(start)}
                          {end ? ` - ${formatTime(end)}` : ""}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{log.taskType}</Badge>
                        </TableCell>
                        <TableCell className="max-w-[180px] truncate">
                          {log.description}
                        </TableCell>
                        <TableCell className="text-center font-bold">
                          {log.hoursWorked}h
                        </TableCell>
                        <TableCell className="text-center">
                          {log.quantity
                            ? `${log.quantity} ${log.unit || ""}`
                            : "—"}
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
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
