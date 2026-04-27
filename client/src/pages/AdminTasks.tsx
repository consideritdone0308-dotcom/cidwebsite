import AppLayout from "@/components/AppLayout";
import { adminNav } from "./AdminPanel";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/lib/trpc";
import { CheckCircle2, ClipboardList, Clock } from "lucide-react";

export default function AdminTasks() {
  return (
    <AppLayout navItems={adminNav} title="Brain & Body Recess Admin">
      <AdminTasksContent />
    </AppLayout>
  );
}

function AdminTasksContent() {
  const { data: tasks, isLoading } = trpc.tasks.listAll.useQuery();
  const { data: employees } = trpc.employees.list.useQuery();

  const empMap = new Map(employees?.map((e) => [e.id, e]) ?? []);

  const pending = tasks?.filter((t) => t.status === "pending") ?? [];
  const completed = tasks?.filter((t) => t.status === "completed") ?? [];

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-4xl">
        <div className="grid grid-cols-2 gap-4">
          {[1, 2].map((i) => <Skeleton key={i} className="h-28 rounded-2xl" />)}
        </div>
        <Skeleton className="h-80 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <Card className="border-border shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Total Tasks</span>
              <div className="h-8 w-8 rounded-lg bg-primary/8 flex items-center justify-center">
                <ClipboardList className="h-4 w-4 text-primary" />
              </div>
            </div>
            <p className="text-3xl font-bold">{tasks?.length ?? 0}</p>
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
            <p className="text-3xl font-bold text-amber-600">{pending.length}</p>
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
            <p className="text-3xl font-bold text-emerald-600">{completed.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Tasks table */}
      <Card className="border-border shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <ClipboardList className="h-4.5 w-4.5 text-primary" />
            All Tasks
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {!tasks || tasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 gap-3 text-center px-6">
              <div className="h-12 w-12 rounded-2xl bg-muted flex items-center justify-center">
                <ClipboardList className="h-5 w-5 text-muted-foreground/50" />
              </div>
              <p className="font-medium text-sm">No tasks yet</p>
              <p className="text-xs text-muted-foreground">Assign tasks to employees from the Overview page.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">Task</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">Assigned To</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">Created</th>
                    <th className="text-right px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {tasks.map((task) => {
                    const emp = empMap.get(task.assignedToEmployeeId);
                    return (
                      <tr key={task.id} className="hover:bg-muted/20 transition-colors">
                        <td className="px-6 py-4 max-w-xs">
                          <p className={`font-medium leading-snug ${task.status === "completed" ? "line-through text-muted-foreground" : ""}`}>
                            {task.description}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                              <span className="text-xs font-semibold text-primary">
                                {(emp?.name || emp?.email || "?").charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <span className="text-muted-foreground text-sm">{emp?.name || emp?.email || "Unknown"}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-muted-foreground">
                          {new Date(task.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </td>
                        <td className="px-6 py-4 text-right">
                          {task.status === "completed" ? (
                            <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs">Completed</Badge>
                          ) : (
                            <Badge className="bg-amber-50 text-amber-700 border-amber-200 text-xs">Pending</Badge>
                          )}
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
