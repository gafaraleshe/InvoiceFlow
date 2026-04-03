import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Download,
  Mail,
  Edit,
  Trash2,
  CheckCircle,
} from "lucide-react";
import { useLocation, useParams } from "wouter";
import { toast } from "sonner";

function formatCurrency(value: number | string): string {
  const num = typeof value === "string" ? parseFloat(value) : value;
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(num);
}

function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "long", year: "numeric" }).format(new Date(date));
}

const statusColors: Record<string, string> = {
  draft: "bg-gray-100 text-gray-700",
  sent: "bg-blue-100 text-blue-700",
  paid: "bg-emerald-100 text-emerald-700",
  overdue: "bg-red-100 text-red-700",
};

export default function InvoiceDetailPage() {
  const params = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const invoiceId = parseInt(params.id || "0", 10);
  const utils = trpc.useUtils();

  const { data: invoice, isLoading } = trpc.invoice.getById.useQuery(
    { id: invoiceId },
    { enabled: invoiceId > 0 }
  );

  const generatePdf = trpc.invoice.generatePdf.useMutation({
    onSuccess: (data) => {
      if (data.pdfUrl) {
        window.open(data.pdfUrl, "_blank");
      }
      toast.success("PDF generated successfully");
      utils.invoice.getById.invalidate({ id: invoiceId });
    },
    onError: (err) => toast.error(err.message),
  });

  const sendEmail = trpc.invoice.sendEmail.useMutation({
    onSuccess: (data) => {
      toast.success(`Invoice sent to ${data.sentTo}`);
      utils.invoice.getById.invalidate({ id: invoiceId });
    },
    onError: (err) => toast.error(err.message),
  });

  const updateStatus = trpc.invoice.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("Status updated");
      utils.invoice.getById.invalidate({ id: invoiceId });
    },
    onError: (err) => toast.error(err.message),
  });

  const deleteInvoice = trpc.invoice.delete.useMutation({
    onSuccess: () => {
      toast.success("Invoice deleted");
      setLocation("/invoices");
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

  if (!invoice) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Invoice not found</p>
        <Button variant="outline" className="mt-4" onClick={() => setLocation("/invoices")}>
          Back to Invoices
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => setLocation("/invoices")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight font-mono">
              {invoice.invoiceNumber}
            </h1>
            <Badge variant="secondary" className={`${statusColors[invoice.status]} capitalize`}>
              {invoice.status}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {invoice.clientName} {invoice.clientCompany ? `(${invoice.clientCompany})` : ""}
          </p>
        </div>
        <div className="flex gap-2">
          {invoice.status === "draft" && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLocation(`/invoices/${invoice.id}/edit`)}
            >
              <Edit className="h-4 w-4 mr-1.5" />
              Edit
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => generatePdf.mutate({ id: invoice.id })}
            disabled={generatePdf.isPending}
          >
            <Download className="h-4 w-4 mr-1.5" />
            {generatePdf.isPending ? "Generating..." : "PDF"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => sendEmail.mutate({ id: invoice.id })}
            disabled={sendEmail.isPending}
          >
            <Mail className="h-4 w-4 mr-1.5" />
            {sendEmail.isPending ? "Sending..." : "Send"}
          </Button>
          {invoice.status !== "paid" && (
            <Button
              size="sm"
              onClick={() => updateStatus.mutate({ id: invoice.id, status: "paid" })}
              disabled={updateStatus.isPending}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              <CheckCircle className="h-4 w-4 mr-1.5" />
              Mark Paid
            </Button>
          )}
        </div>
      </div>

      {/* Invoice Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Line Items</CardTitle>
          </CardHeader>
          <CardContent>
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider py-2 px-2">
                    Description
                  </th>
                  <th className="text-center text-xs font-medium text-muted-foreground uppercase tracking-wider py-2 px-2">
                    Qty
                  </th>
                  <th className="text-right text-xs font-medium text-muted-foreground uppercase tracking-wider py-2 px-2">
                    Unit Price
                  </th>
                  <th className="text-right text-xs font-medium text-muted-foreground uppercase tracking-wider py-2 px-2">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody>
                {invoice.lineItems.map((item: any, idx: number) => (
                  <tr key={idx} className="border-b last:border-0">
                    <td className="py-3 px-2 text-sm">{item.description}</td>
                    <td className="py-3 px-2 text-sm text-center font-mono">
                      {Number(item.quantity).toFixed(2)}
                    </td>
                    <td className="py-3 px-2 text-sm text-right font-mono">
                      {formatCurrency(item.unitPrice)}
                    </td>
                    <td className="py-3 px-2 text-sm text-right font-mono font-medium">
                      {formatCurrency(item.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <Separator className="my-4" />

            <div className="flex justify-end">
              <div className="w-64 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-mono">{formatCurrency(invoice.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    VAT ({Number(invoice.vatRate).toFixed(0)}%)
                  </span>
                  <span className="font-mono">{formatCurrency(invoice.vatAmount)}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-base font-bold">
                  <span>Total</span>
                  <span className="font-mono">{formatCurrency(invoice.total)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <span className="text-muted-foreground block text-xs uppercase tracking-wider mb-1">
                  Issue Date
                </span>
                <span>{formatDate(invoice.issueDate)}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-xs uppercase tracking-wider mb-1">
                  Due Date
                </span>
                <span>{formatDate(invoice.dueDate)}</span>
              </div>
              {invoice.sentAt && (
                <div>
                  <span className="text-muted-foreground block text-xs uppercase tracking-wider mb-1">
                    Sent
                  </span>
                  <span>{formatDate(invoice.sentAt)}</span>
                </div>
              )}
              {invoice.paidAt && (
                <div>
                  <span className="text-muted-foreground block text-xs uppercase tracking-wider mb-1">
                    Paid
                  </span>
                  <span>{formatDate(invoice.paidAt)}</span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Client</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-sm">
              <p className="font-medium">{invoice.clientName}</p>
              {invoice.clientCompany && (
                <p className="text-muted-foreground">{invoice.clientCompany}</p>
              )}
              {invoice.clientEmail && (
                <p className="text-muted-foreground">{invoice.clientEmail}</p>
              )}
              {invoice.clientAddressLine1 && <p>{invoice.clientAddressLine1}</p>}
              {invoice.clientAddressLine2 && <p>{invoice.clientAddressLine2}</p>}
              {(invoice.clientCity || invoice.clientPostcode) && (
                <p>
                  {invoice.clientCity}
                  {invoice.clientCity && invoice.clientPostcode ? ", " : ""}
                  {invoice.clientPostcode}
                </p>
              )}
            </CardContent>
          </Card>

          {invoice.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{invoice.notes}</p>
              </CardContent>
            </Card>
          )}

          {invoice.status !== "paid" && (
            <Button
              variant="destructive"
              size="sm"
              className="w-full"
              onClick={() => {
                if (confirm("Are you sure you want to delete this invoice?")) {
                  deleteInvoice.mutate({ id: invoice.id });
                }
              }}
              disabled={deleteInvoice.isPending}
            >
              <Trash2 className="h-4 w-4 mr-1.5" />
              Delete Invoice
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
