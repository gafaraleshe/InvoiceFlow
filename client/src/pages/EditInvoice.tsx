import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { toast } from "sonner";

interface LineItemForm {
  description: string;
  quantity: number;
  unitPrice: number;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(value);
}

export default function EditInvoicePage() {
  const params = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const invoiceId = params.id ?? "";

  const { data: invoice, isLoading } = trpc.invoice.getById.useQuery(
    { id: invoiceId },
    { enabled: !!invoiceId }
  );

  const [issueDate, setIssueDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [vatRate, setVatRate] = useState(20);
  const [notes, setNotes] = useState("");
  const [lineItems, setLineItems] = useState<LineItemForm[]>([]);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (invoice && !initialized) {
      setIssueDate(new Date(invoice.issueDate).toISOString().split("T")[0]);
      setDueDate(new Date(invoice.dueDate).toISOString().split("T")[0]);
      setVatRate(Number(invoice.taxRate));
      setNotes(invoice.notes || "");
      setLineItems(
        invoice.lineItems.map((item: any) => ({
          description: item.description,
          quantity: Number(item.quantity),
          unitPrice: Number(item.unitPrice),
        }))
      );
      setInitialized(true);
    }
  }, [invoice, initialized]);

  const subtotal = useMemo(
    () =>
      lineItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0),
    [lineItems]
  );
  const vatAmount = useMemo(
    () => Number(((subtotal * vatRate) / 100).toFixed(2)),
    [subtotal, vatRate]
  );
  const total = useMemo(
    () => Number((subtotal + vatAmount).toFixed(2)),
    [subtotal, vatAmount]
  );

  const updateInvoice = trpc.invoice.update.useMutation({
    onSuccess: () => {
      toast.success("Invoice updated");
      setLocation(`/invoices/${invoiceId}`);
    },
    onError: err => toast.error(err.message),
  });

  const addLineItem = () => {
    setLineItems([
      ...lineItems,
      { description: "", quantity: 1, unitPrice: 0 },
    ]);
  };

  const removeLineItem = (index: number) => {
    if (lineItems.length <= 1) return;
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  const updateLineItem = (
    index: number,
    field: keyof LineItemForm,
    value: string | number
  ) => {
    const updated = [...lineItems];
    updated[index] = { ...updated[index], [field]: value };
    setLineItems(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const validItems = lineItems.filter(item => item.description.trim());
    if (validItems.length === 0) {
      toast.error("Add at least one line item");
      return;
    }

    updateInvoice.mutate({
      id: invoiceId,
      issueDate: new Date(issueDate).getTime(),
      dueDate: new Date(dueDate).getTime(),
      vatRate,
      notes: notes || undefined,
      lineItems: validItems.map((item, idx) => ({
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        sortOrder: idx,
      })),
    });
  };

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
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setLocation(`/invoices/${invoiceId}`)}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Edit {invoice.number}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Update invoice details and line items
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Invoice Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Issue Date</Label>
                  <Input
                    type="date"
                    value={issueDate}
                    onChange={e => setIssueDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Due Date</Label>
                  <Input
                    type="date"
                    value={dueDate}
                    onChange={e => setDueDate(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>VAT Rate (%)</Label>
                <Input
                  type="number"
                  value={vatRate}
                  onChange={e => setVatRate(Number(e.target.value))}
                  min={0}
                  max={100}
                />
              </div>
              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Additional notes..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-mono">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">VAT ({vatRate}%)</span>
                <span className="font-mono">{formatCurrency(vatAmount)}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="font-mono">{formatCurrency(total)}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Line Items</CardTitle>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addLineItem}
            >
              <Plus className="h-4 w-4 mr-1.5" />
              Add Item
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="grid grid-cols-12 gap-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                <div className="col-span-5">Description</div>
                <div className="col-span-2">Quantity</div>
                <div className="col-span-2">Unit Price</div>
                <div className="col-span-2 text-right">Amount</div>
                <div className="col-span-1" />
              </div>
              {lineItems.map((item, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-3 items-center">
                  <div className="col-span-5">
                    <Input
                      placeholder="Description"
                      value={item.description}
                      onChange={e =>
                        updateLineItem(idx, "description", e.target.value)
                      }
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      type="number"
                      value={item.quantity}
                      onChange={e =>
                        updateLineItem(idx, "quantity", Number(e.target.value))
                      }
                      min={0}
                      step="0.01"
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      type="number"
                      value={item.unitPrice}
                      onChange={e =>
                        updateLineItem(idx, "unitPrice", Number(e.target.value))
                      }
                      min={0}
                      step="0.01"
                    />
                  </div>
                  <div className="col-span-2 text-right font-mono text-sm font-medium">
                    {formatCurrency(item.quantity * item.unitPrice)}
                  </div>
                  <div className="col-span-1 flex justify-end">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeLineItem(idx)}
                      disabled={lineItems.length <= 1}
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => setLocation(`/invoices/${invoiceId}`)}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={updateInvoice.isPending}>
            {updateInvoice.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}
