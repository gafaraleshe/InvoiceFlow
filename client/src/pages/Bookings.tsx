import { trpc } from "@/lib/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  CalendarCheck,
  Search,
  MoreHorizontal,
  FileText,
  ArrowRight,
  Mail,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";

// ── booking pipeline metadata ─────────────────────────────────────────────
const STATUSES = [
  "new",
  "contacted",
  "quoted",
  "confirmed",
  "completed",
  "cancelled",
] as const;
type Status = (typeof STATUSES)[number];

const STATUS_LABEL: Record<Status, string> = {
  new: "New",
  contacted: "Contacted",
  quoted: "Quoted",
  confirmed: "Confirmed",
  completed: "Completed",
  cancelled: "Cancelled",
};

function statusClasses(s: Status): string {
  switch (s) {
    case "new":
      return "border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400";
    case "contacted":
      return "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400";
    case "quoted":
      return "border-violet-500/30 bg-violet-500/10 text-violet-600 dark:text-violet-400";
    case "confirmed":
      return "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400";
    case "completed":
      return "border-primary/30 bg-primary/10 text-primary";
    case "cancelled":
      return "border-border bg-muted text-muted-foreground line-through";
  }
}

function money(v: string | number | null | undefined, currency = "GBP") {
  if (v == null) return "—";
  const n = typeof v === "string" ? parseFloat(v) : v;
  if (Number.isNaN(n)) return "—";
  return new Intl.NumberFormat("en-GB", { style: "currency", currency }).format(
    n
  );
}

type Booking = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  serviceType: string | null;
  packageName: string | null;
  eventDate: string | null;
  location: string | null;
  amount: string | null;
  currency: string;
  status: Status;
  source: string;
  invoiceId: string | null;
  createdAt: string;
};

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-muted-foreground text-xs uppercase tracking-wider">
          {label}
        </p>
        <p className="mt-1 text-2xl font-bold tracking-tight">{value}</p>
      </CardContent>
    </Card>
  );
}

export default function BookingsPage() {
  const [, setLocation] = useLocation();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"all" | Status>("all");
  const [convertFor, setConvertFor] = useState<Booking | null>(null);
  const utils = trpc.useUtils();

  const queryInput = useMemo(
    () => ({ search: search || undefined, status, limit: 100, offset: 0 }),
    [search, status]
  );

  const { data, isLoading } = trpc.booking.list.useQuery(queryInput);
  const { data: stats } = trpc.booking.stats.useQuery();

  const invalidate = () => {
    utils.booking.list.invalidate();
    utils.booking.stats.invalidate();
  };

  const updateStatus = trpc.booking.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("Booking updated");
      invalidate();
    },
    onError: err => toast.error(err.message),
  });

  const bookings = (data?.items ?? []) as unknown as Booking[];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Bookings</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Your CRM pipeline — enquiries from your booking sites, ready to
            quote and invoice.
          </p>
        </div>
      </div>

      {/* Pipeline stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatTile label="Total" value={String(stats?.total ?? 0)} />
        <StatTile label="New" value={String(stats?.newCount ?? 0)} />
        <StatTile label="Confirmed" value={String(stats?.confirmedCount ?? 0)} />
        <StatTile
          label="Pipeline value"
          value={money(stats?.pipelineValue ?? 0)}
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search bookings..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          <FilterChip
            active={status === "all"}
            onClick={() => setStatus("all")}
            label="All"
          />
          {STATUSES.map(s => (
            <FilterChip
              key={s}
              active={status === s}
              onClick={() => setStatus(s)}
              label={STATUS_LABEL[s]}
            />
          ))}
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-3 p-6">
              {[1, 2, 3, 4].map(i => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : bookings.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <CalendarCheck className="mx-auto mb-3 h-10 w-10 opacity-40" />
              <p className="text-sm font-medium">No bookings yet</p>
              <p className="mt-1 text-xs">
                Connect a booking site on the Integrations page and enquiries
                will land here automatically.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/30">
                    {[
                      "Customer",
                      "Service",
                      "Event date",
                      "Amount",
                      "Status",
                      "Source",
                      "",
                    ].map((h, i) => (
                      <th
                        key={i}
                        className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {bookings.map(b => (
                    <tr
                      key={b.id}
                      className="border-b transition-colors last:border-0 hover:bg-muted/50"
                    >
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium">{b.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {b.email}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {b.packageName || b.serviceType || "—"}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {b.eventDate || "—"}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {money(b.amount, b.currency)}
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant="outline"
                          className={statusClasses(b.status)}
                        >
                          {STATUS_LABEL[b.status]}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {b.source}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-52">
                            {b.invoiceId ? (
                              <DropdownMenuItem
                                onClick={() =>
                                  setLocation(`/invoices/${b.invoiceId}`)
                                }
                              >
                                <FileText className="mr-2 h-4 w-4" />
                                View invoice
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem onClick={() => setConvertFor(b)}>
                                <ArrowRight className="mr-2 h-4 w-4" />
                                Convert to invoice
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            {STATUSES.filter(s => s !== b.status).map(s => (
                              <DropdownMenuItem
                                key={s}
                                onClick={() =>
                                  updateStatus.mutate({ id: b.id, status: s })
                                }
                              >
                                Mark {STATUS_LABEL[s]}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <ConvertDialog
        booking={convertFor}
        onClose={() => setConvertFor(null)}
        onDone={invalidate}
      />
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-background text-muted-foreground hover:bg-accent"
      }`}
    >
      {label}
    </button>
  );
}

function ConvertDialog({
  booking,
  onClose,
  onDone,
}: {
  booking: Booking | null;
  onClose: () => void;
  onDone: () => void;
}) {
  const [, setLocation] = useLocation();
  const [amount, setAmount] = useState("");
  const [send, setSend] = useState(true);

  const convert = trpc.booking.convertToInvoice.useMutation({
    onSuccess: res => {
      toast.success(
        res.emailed
          ? "Invoice created and emailed to the customer"
          : "Invoice created"
      );
      onDone();
      onClose();
      if (res.invoice?.id) setLocation(`/invoices/${res.invoice.id}`);
    },
    onError: err => toast.error(err.message),
  });

  // Prefill from the booking's quoted amount when opened.
  const quoted = booking?.amount ? parseFloat(booking.amount) : 0;
  const open = !!booking;

  return (
    <Dialog
      open={open}
      onOpenChange={o => {
        if (!o) onClose();
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Convert booking to invoice</DialogTitle>
          <DialogDescription>
            Raise a draft invoice for {booking?.name}. A client is created or
            reused automatically.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-sm font-medium">
              Amount (ex-VAT)
            </label>
            <Input
              type="number"
              min="0"
              step="0.01"
              placeholder={quoted ? String(quoted) : "e.g. 1200"}
              value={amount}
              onChange={e => setAmount(e.target.value)}
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Leave blank to use the quoted amount
              {quoted ? ` (${money(quoted, booking?.currency)})` : ""}.
            </p>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={send}
              onChange={e => setSend(e.target.checked)}
              className="h-4 w-4 rounded border-border"
            />
            <Mail className="h-4 w-4 text-muted-foreground" />
            Email the invoice to the customer now
          </label>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            disabled={convert.isPending}
            onClick={() =>
              booking &&
              convert.mutate({
                id: booking.id,
                amount: amount ? Number(amount) : undefined,
                send,
              })
            }
          >
            {convert.isPending ? "Creating…" : "Create invoice"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
