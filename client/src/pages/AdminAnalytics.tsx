import AppLayout from "@/components/AppLayout";
import { adminNav } from "./AdminPanel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/lib/trpc";
import { BarChart2, CheckCircle2, Clock, Timer, Users, X } from "lucide-react";
import { useState } from "react";

export default function AdminAnalytics() {
  return (
    <AppLayout navItems={adminNav} title="Admin Panel">
      <AnalyticsContent />
    </AppLayout>
  );
}

function formatHours(h: number): string {
  const hrs = Math.floor(h);
  const mins = Math.round((h - hrs) * 60);
  if (hrs === 0) return `${mins}m`;
  if (mins === 0) return `${hrs}h`;
  return `${hrs}h ${mins}m`;
}

function AnalyticsContent() {
  const [startDateStr, setStartDateStr] = useState("");
  const [endDateStr, setEndDateStr] = useState("");

  const startDate = startDateStr ? new Date(startDateStr) : undefined;
  const endDate = endDateStr ? new Date(endDateStr + "T23:59:59") : undefined;

  const { data: tasks, isLoading: tasksLoading } = trpc.tasks.listAll.useQuery(
    { startDate, endDate },
    { enabled: true }
  );
  const { data: timeLogs, isLoading: logsLoading } = trpc.timeLogs.listAll.useQuery(
    { startDate, endDate },
    { enabled: true }
  );
  const { data: employees, isLoading: empLoading } = trpc.employees.list.useQuery();

  const isLoading = tasksLoading || logsLoading || empLoading;

  const totalTasks = tasks?.length ?? 0;
  const completedTasks = tasks?.filter((t) => t.status === "completed").length ?? 0;
  const pendingTasks = totalTasks - completedTasks;
  const totalHours = timeLogs?.reduce((sum, l) => sum + (l.hoursWorked ?? 0), 0) ?? 0;

  const clearFilters = () => {
    setStartDateStr("");
    setEndDateStr("");
  };

  const hasFilters = !!startDateStr || !!endDateStr;

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Date filter */}
      <Card className="border-border shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <BarChart2 className="h-4.5 w-4.5 text-primary" />
            Date Range Filter
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-end gap-4">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Start Date</Label>
              <Input
                type="date"
                value={startDateStr}
                onChange={(e) => setStartDateStr(e.target.value)}
                className="h-10 w-44"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">End Date</Label>
              <Input
                type="date"
                value={endDateStr}
                onChange={(e) => setEndDateStr(e.target.value)}
                className="h-10 w-44"
              />
            </div>
            {hasFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="h-10 gap-1.5 text-muted-foreground">
                <X className="h-3.5 w-3.5" />
                Clear
              </Button>
            )}
            {hasFilters && (
              <Badge variant="secondary" className="h-7 px-3 text-xs">
                Filtered: {startDateStr || "—"} → {endDateStr || "—"}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Metrics */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-28 rounded-2xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card className="border-border shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Total Tasks</span>
                <div className="h-8 w-8 rounded-lg bg-primary/8 flex items-center justify-center">
                  <BarChart2 className="h-4 w-4 text-primary" />
                </div>
              </div>
              <p className="text-3xl font-bold">{totalTasks}</p>
            </CardContent>
          </Card>

          <Card className="border-border shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Completed</span>
                <div className="h-8 w-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                </div>
              </div>
              <p className="text-3xl font-bold text-emerald-600">{completedTasks}</p>
              {totalTasks > 0 && (
                <p className="text-xs text-muted-foreground mt-1">{Math.round((completedTasks / totalTasks) * 100)}% completion rate</p>
              )}
            </CardContent>
          </Card>

          <Card className="border-border shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Pending</span>
                <div className="h-8 w-8 rounded-lg bg-amber-50 flex items-center justify-center">
                  <Clock className="h-4 w-4 text-amber-600" />
                </div>
              </div>
              <p className="text-3xl font-bold text-amber-600">{pendingTasks}</p>
            </CardContent>
          </Card>

          <Card className="border-border shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Hours Logged</span>
                <div className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center">
                  <Timer className="h-4 w-4 text-blue-600" />
                </div>
              </div>
              <p className="text-3xl font-bold text-blue-600">{formatHours(totalHours)}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Per-employee overview */}
      <Card className="border-border shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Users className="h-4.5 w-4.5 text-primary" />
            Per-Employee Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
            </div>
          ) : !employees || employees.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3 text-center px-6">
              <div className="h-12 w-12 rounded-2xl bg-muted flex items-center justify-center">
                <Users className="h-5 w-5 text-muted-foreground/50" />
              </div>
              <p className="font-medium text-sm">No employees yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">Employee</th>
                    <th className="text-center px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">Assigned</th>
                    <th className="text-center px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">Completed</th>
                    <th className="text-center px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">Pending</th>
                    <th className="text-center px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">Hours Logged</th>
                    <th className="text-right px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">Completion</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {employees.map((emp) => {
                    const empTasks = tasks?.filter((t) => t.assignedToEmployeeId === emp.id) ?? [];
                    const empCompleted = empTasks.filter((t) => t.status === "completed").length;
                    const empPending = empTasks.length - empCompleted;
                    const empLogs = timeLogs?.filter((l) => l.employeeId === emp.id) ?? [];
                    const empHours = empLogs.reduce((sum, l) => sum + (l.hoursWorked ?? 0), 0);
                    const completionRate = empTasks.length > 0 ? Math.round((empCompleted / empTasks.length) * 100) : 0;

                    return (
                      <tr key={emp.id} className="hover:bg-muted/20 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                              <span className="text-xs font-semibold text-primary">
                                {(emp.name || emp.email).charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium">{emp.name || "—"}</p>
                              <p className="text-xs text-muted-foreground">{emp.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center font-medium">{empTasks.length}</td>
                        <td className="px-6 py-4 text-center">
                          <span className="font-medium text-emerald-600">{empCompleted}</span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="font-medium text-amber-600">{empPending}</span>
                        </td>
                        <td className="px-6 py-4 text-center font-medium text-blue-600">
                          {empHours > 0 ? formatHours(empHours) : "—"}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <div className="w-20 h-1.5 rounded-full bg-muted overflow-hidden">
                              <div
                                className="h-full rounded-full bg-emerald-500 transition-all"
                                style={{ width: `${completionRate}%` }}
                              />
                            </div>
                            <span className="text-xs font-medium text-muted-foreground w-8 text-right">{completionRate}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
