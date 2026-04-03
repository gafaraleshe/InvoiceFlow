import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  PoundSterling,
  FileText,
  Users,
  AlertTriangle,
  Plus,
  ArrowRight,
} from "lucide-react";
import { useLocation } from "wouter";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(value);
}

function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

const statusColors: Record<string, string> = {
  draft: "bg-gray-100 text-gray-700",
  sent: "bg-blue-100 text-blue-700",
  paid: "bg-emerald-100 text-emerald-700",
  overdue: "bg-red-100 text-red-700",
};

export default function Home() {
  const [, setLocation] = useLocation();
  const { data: stats, isLoading: statsLoading } =
    trpc.dashboard.stats.useQuery();
  const { data: recentInvoices, isLoading: invoicesLoading } =
    trpc.dashboard.recentInvoices.useQuery();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Overview of your invoicing activity
          </p>
        </div>
        <Button onClick={() => setLocation("/invoices/new")} size="sm">
          <Plus className="h-4 w-4 mr-1.5" />
          New Invoice
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Revenue
            </CardTitle>
            <PoundSterling className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <div className="text-2xl font-bold">
                {formatCurrency(stats?.totalRevenue ?? 0)}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Outstanding
            </CardTitle>
            <PoundSterling className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <div className="text-2xl font-bold text-amber-600">
                {formatCurrency(stats?.outstanding ?? 0)}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Invoices
            </CardTitle>
            <FileText className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">
                {stats?.invoiceCount ?? 0}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Overdue
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold text-red-600">
                {stats?.overdueCount ?? 0}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Invoices */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base font-semibold">
            Recent Invoices
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation("/invoices")}
            className="text-primary"
          >
            View all
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </CardHeader>
        <CardContent>
          {invoicesLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : !recentInvoices || recentInvoices.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No invoices yet</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() => setLocation("/invoices/new")}
              >
                Create your first invoice
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider py-3 px-2">
                      Invoice
                    </th>
                    <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider py-3 px-2">
                      Client
                    </th>
                    <th className="text-right text-xs font-medium text-muted-foreground uppercase tracking-wider py-3 px-2">
                      Total
                    </th>
                    <th className="text-center text-xs font-medium text-muted-foreground uppercase tracking-wider py-3 px-2">
                      Status
                    </th>
                    <th className="text-right text-xs font-medium text-muted-foreground uppercase tracking-wider py-3 px-2">
                      Due Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recentInvoices.map((inv: any) => (
                    <tr
                      key={inv.id}
                      className="border-b last:border-0 hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => setLocation(`/invoices/${inv.id}`)}
                    >
                      <td className="py-3 px-2">
                        <span className="font-mono text-sm font-medium">
                          {inv.invoiceNumber}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-sm">
                        {inv.clientName || "—"}
                      </td>
                      <td className="py-3 px-2 text-sm font-mono font-semibold text-right">
                        {formatCurrency(Number(inv.total))}
                      </td>
                      <td className="py-3 px-2 text-center">
                        <Badge
                          variant="secondary"
                          className={`${statusColors[inv.status] || ""} text-xs capitalize`}
                        >
                          {inv.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-2 text-sm text-muted-foreground text-right">
                        {formatDate(inv.dueDate)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
