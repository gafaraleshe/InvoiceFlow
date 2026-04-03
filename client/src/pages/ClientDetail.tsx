import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Edit, Trash2, FileText } from "lucide-react";
import { useLocation, useParams } from "wouter";
import { toast } from "sonner";

function formatCurrency(value: number | string): string {
  const num = typeof value === "string" ? parseFloat(value) : value;
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(num);
}

function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(date));
}

const statusColors: Record<string, string> = {
  draft: "bg-gray-100 text-gray-700",
  sent: "bg-blue-100 text-blue-700",
  paid: "bg-emerald-100 text-emerald-700",
  overdue: "bg-red-100 text-red-700",
};

export default function ClientDetailPage() {
  const params = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const clientId = parseInt(params.id || "0", 10);

  const { data: client, isLoading } = trpc.clients.getById.useQuery(
    { id: clientId },
    { enabled: clientId > 0 }
  );

  const { data: invoicesData } = trpc.invoice.list.useQuery(
    { clientId, limit: 20, offset: 0, status: "all" },
    { enabled: clientId > 0 }
  );

  const deleteClient = trpc.clients.delete.useMutation({
    onSuccess: () => {
      toast.success("Client deleted");
      setLocation("/clients");
    },
    onError: (err) => toast.error(err.message),
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!client) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Client not found</p>
        <Button variant="outline" className="mt-4" onClick={() => setLocation("/clients")}>
          Back to Clients
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => setLocation("/clients")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">{client.name}</h1>
          {client.company && (
            <p className="text-sm text-muted-foreground mt-1">{client.company}</p>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setLocation(`/clients/${client.id}/edit`)}
          >
            <Edit className="h-4 w-4 mr-1.5" />
            Edit
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => {
              if (confirm("Are you sure you want to delete this client?")) {
                deleteClient.mutate({ id: client.id });
              }
            }}
            disabled={deleteClient.isPending}
          >
            <Trash2 className="h-4 w-4 mr-1.5" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Contact Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <span className="text-muted-foreground block text-xs uppercase tracking-wider mb-1">Email</span>
              <span>{client.email}</span>
            </div>
            {client.phone && (
              <div>
                <span className="text-muted-foreground block text-xs uppercase tracking-wider mb-1">Phone</span>
                <span>{client.phone}</span>
              </div>
            )}
            <div>
              <span className="text-muted-foreground block text-xs uppercase tracking-wider mb-1">Payment Terms</span>
              <span>{client.paymentTerms} days</span>
            </div>
            {(client.addressLine1 || client.city) && (
              <div>
                <span className="text-muted-foreground block text-xs uppercase tracking-wider mb-1">Address</span>
                {client.addressLine1 && <p>{client.addressLine1}</p>}
                {client.addressLine2 && <p>{client.addressLine2}</p>}
                {(client.city || client.postcode) && (
                  <p>
                    {client.city}{client.city && client.postcode ? ", " : ""}{client.postcode}
                  </p>
                )}
                {client.country && <p>{client.country}</p>}
              </div>
            )}
            {client.notes && (
              <div>
                <span className="text-muted-foreground block text-xs uppercase tracking-wider mb-1">Notes</span>
                <p className="text-muted-foreground">{client.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Invoices</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLocation("/invoices/new")}
            >
              <FileText className="h-4 w-4 mr-1.5" />
              New Invoice
            </Button>
          </CardHeader>
          <CardContent>
            {!invoicesData || invoicesData.items.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-8 w-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm">No invoices for this client</p>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider py-2 px-2">Invoice</th>
                    <th className="text-right text-xs font-medium text-muted-foreground uppercase tracking-wider py-2 px-2">Total</th>
                    <th className="text-center text-xs font-medium text-muted-foreground uppercase tracking-wider py-2 px-2">Status</th>
                    <th className="text-right text-xs font-medium text-muted-foreground uppercase tracking-wider py-2 px-2">Due</th>
                  </tr>
                </thead>
                <tbody>
                  {invoicesData.items.map((inv: any) => (
                    <tr
                      key={inv.id}
                      className="border-b last:border-0 hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => setLocation(`/invoices/${inv.id}`)}
                    >
                      <td className="py-3 px-2 font-mono text-sm font-medium">{inv.invoiceNumber}</td>
                      <td className="py-3 px-2 text-sm font-mono text-right">{formatCurrency(inv.total)}</td>
                      <td className="py-3 px-2 text-center">
                        <Badge variant="secondary" className={`${statusColors[inv.status]} text-xs capitalize`}>
                          {inv.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-2 text-sm text-muted-foreground text-right">{formatDate(inv.dueDate)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
