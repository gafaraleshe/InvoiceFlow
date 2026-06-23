import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FileText,
  Users,
  Settings,
  Search,
  Bell,
  Plus,
  TrendingUp,
  ArrowUpRight,
  CheckCircle2,
  Send,
  Clock,
} from "lucide-react";
import type { ReactNode } from "react";

/**
 * Faux product-UI "screenshots". Per DESIGN.md, product screenshots are the
 * protagonist of every section, so these are built as high-fidelity HTML/CSS
 * renders of the actual InvoiceFlow app, framed in dark surface-1 panels.
 */

/** App-window chrome wrapper with traffic-light dots + a fake URL bar. */
export function WindowFrame({
  children,
  className,
  url = "app.invoiceflow.com",
}: {
  children: ReactNode;
  className?: string;
  url?: string;
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-[#23252a] bg-[#0b0b0c] shadow-[0_40px_120px_-40px_rgba(0,0,0,0.9)]",
        "ring-1 ring-white/5",
        className
      )}
    >
      <div className="flex items-center gap-3 border-b border-[#1c1d20] bg-[#0f1011] px-4 py-2.5">
        <div className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#2a2b2f]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#2a2b2f]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#2a2b2f]" />
        </div>
        <div className="mx-auto flex h-6 w-full max-w-[280px] items-center justify-center gap-1.5 rounded-md bg-[#08080a] text-[11px] text-[#62666d]">
          <span className="h-2.5 w-2.5 rounded-full border border-[#34343a]" />
          {url}
        </div>
        <div className="h-2.5 w-8" />
      </div>
      {children}
    </div>
  );
}

const sidebarNav = [
  { icon: LayoutDashboard, label: "Dashboard", active: true },
  { icon: FileText, label: "Invoices", active: false },
  { icon: Users, label: "Clients", active: false },
  { icon: Settings, label: "Settings", active: false },
];

const stats = [
  {
    label: "Total Revenue",
    value: "£248,910",
    delta: "+18.2%",
    accent: "#27a644",
  },
  { label: "Outstanding", value: "£32,540", delta: "+4.1%", accent: "#d8a200" },
  { label: "Invoices", value: "1,284", delta: "+96", accent: "#5e6ad2" },
  { label: "Overdue", value: "7", delta: "−3", accent: "#c75d5d" },
];

type Row = {
  number: string;
  client: string;
  total: string;
  status: "Paid" | "Sent" | "Overdue" | "Draft";
  due: string;
};

const rows: Row[] = [
  {
    number: "INV-2026-184",
    client: "Northwind Studio",
    total: "£4,200.00",
    status: "Paid",
    due: "12 Jun",
  },
  {
    number: "INV-2026-183",
    client: "Atlas Logistics",
    total: "£18,950.00",
    status: "Sent",
    due: "28 Jun",
  },
  {
    number: "INV-2026-182",
    client: "Bright & Co.",
    total: "£2,480.00",
    status: "Overdue",
    due: "04 Jun",
  },
  {
    number: "INV-2026-181",
    client: "Meridian Health",
    total: "£9,120.00",
    status: "Paid",
    due: "09 Jun",
  },
  {
    number: "INV-2026-180",
    client: "Cobalt Design",
    total: "£1,340.00",
    status: "Draft",
    due: "—",
  },
];

const statusStyles: Record<
  Row["status"],
  { dot: string; text: string; bg: string }
> = {
  Paid: { dot: "#27a644", text: "#7fe0a0", bg: "rgba(39,166,68,0.12)" },
  Sent: { dot: "#5e6ad2", text: "#aab2f5", bg: "rgba(94,106,210,0.14)" },
  Overdue: { dot: "#c75d5d", text: "#f0a0a0", bg: "rgba(199,93,93,0.12)" },
  Draft: { dot: "#62666d", text: "#9aa0a8", bg: "rgba(255,255,255,0.05)" },
};

const StatusBadge = ({ status }: { status: Row["status"] }) => {
  const s = statusStyles[status];
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium"
      style={{ background: s.bg, color: s.text }}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ background: s.dot }}
      />
      {status}
    </span>
  );
};

/** Mini revenue bar chart rendered with divs. */
function MiniChart() {
  const bars = [38, 52, 44, 61, 49, 72, 66, 81, 70, 88, 79, 96];
  return (
    <div className="flex h-[120px] items-end gap-1.5 sm:gap-2">
      {bars.map((h, i) => (
        <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
          <div
            className="w-full rounded-[3px]"
            style={{
              height: `${h}%`,
              background:
                i === bars.length - 1
                  ? "#5e6ad2"
                  : "linear-gradient(180deg, rgba(94,106,210,0.55), rgba(94,106,210,0.12))",
            }}
          />
        </div>
      ))}
    </div>
  );
}

/**
 * The hero "screenshot": the full InvoiceFlow dashboard.
 */
export function ProductDashboardMock({ className }: { className?: string }) {
  return (
    <WindowFrame className={className}>
      <div className="flex min-h-[460px] bg-[#0a0a0b] text-left">
        {/* Sidebar */}
        <aside className="hidden w-[200px] shrink-0 flex-col border-r border-[#1a1b1e] bg-[#0c0c0e] p-3 sm:flex">
          <div className="flex items-center gap-2 px-2 py-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-[#5e6ad2] text-[13px] font-bold text-white">
              I
            </div>
            <span className="text-[14px] font-semibold tracking-tight text-[#f7f8f8]">
              InvoiceFlow
            </span>
          </div>
          <nav className="mt-4 flex flex-col gap-0.5">
            {sidebarNav.map(item => (
              <div
                key={item.label}
                className={cn(
                  "flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-[13px]",
                  item.active
                    ? "bg-[#5e6ad2]/12 text-[#f7f8f8]"
                    : "text-[#8a8f98]"
                )}
              >
                <item.icon
                  className="h-3.5 w-3.5"
                  style={{ color: item.active ? "#828fff" : undefined }}
                />
                {item.label}
              </div>
            ))}
          </nav>
          <div className="mt-auto flex items-center gap-2 rounded-md px-2 py-2">
            <div className="h-7 w-7 rounded-full bg-gradient-to-br from-[#5e6ad2] to-[#828fff] text-center text-[12px] font-semibold leading-7 text-white">
              A
            </div>
            <div className="min-w-0">
              <div className="truncate text-[12px] font-medium text-[#d0d6e0]">
                Avery Klein
              </div>
              <div className="truncate text-[10px] text-[#62666d]">Admin</div>
            </div>
          </div>
        </aside>

        {/* Main */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Topbar */}
          <div className="flex items-center justify-between border-b border-[#1a1b1e] px-4 py-3 sm:px-5">
            <div>
              <div className="text-[15px] font-semibold tracking-tight text-[#f7f8f8]">
                Dashboard
              </div>
              <div className="text-[11px] text-[#62666d]">
                Overview of your invoicing activity
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="hidden items-center gap-1.5 rounded-md border border-[#23252a] bg-[#0f1011] px-2.5 py-1.5 text-[11px] text-[#62666d] md:flex">
                <Search className="h-3 w-3" />
                Search…
              </div>
              <div className="flex h-7 w-7 items-center justify-center rounded-md border border-[#23252a] bg-[#0f1011]">
                <Bell className="h-3.5 w-3.5 text-[#8a8f98]" />
              </div>
              <div className="flex items-center gap-1.5 rounded-md bg-[#5e6ad2] px-2.5 py-1.5 text-[11px] font-medium text-white">
                <Plus className="h-3 w-3" />
                New Invoice
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 space-y-4 p-4 sm:p-5">
            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              {stats.map(s => (
                <div
                  key={s.label}
                  className="rounded-lg border border-[#1d1e21] bg-[#0f1011] p-3"
                >
                  <div className="text-[11px] text-[#62666d]">{s.label}</div>
                  <div className="mt-1.5 text-[18px] font-semibold tracking-tight text-[#f7f8f8]">
                    {s.value}
                  </div>
                  <div
                    className="mt-1 inline-flex items-center gap-1 text-[10px] font-medium"
                    style={{ color: s.accent }}
                  >
                    <TrendingUp className="h-2.5 w-2.5" />
                    {s.delta}
                  </div>
                </div>
              ))}
            </div>

            {/* Chart + table */}
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-5">
              <div className="rounded-lg border border-[#1d1e21] bg-[#0f1011] p-4 lg:col-span-2">
                <div className="flex items-center justify-between">
                  <div className="text-[12px] font-medium text-[#d0d6e0]">
                    Revenue
                  </div>
                  <span className="text-[10px] text-[#62666d]">Last 12 mo</span>
                </div>
                <div className="mt-4">
                  <MiniChart />
                </div>
              </div>

              <div className="rounded-lg border border-[#1d1e21] bg-[#0f1011] lg:col-span-3">
                <div className="flex items-center justify-between border-b border-[#1a1b1e] px-4 py-2.5">
                  <span className="text-[12px] font-medium text-[#d0d6e0]">
                    Recent Invoices
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] text-[#828fff]">
                    View all <ArrowUpRight className="h-2.5 w-2.5" />
                  </span>
                </div>
                <div className="divide-y divide-[#161719]">
                  {rows.map(r => (
                    <div
                      key={r.number}
                      className="grid grid-cols-[1.1fr_1.2fr_0.9fr_0.8fr] items-center gap-2 px-4 py-2.5 text-[11px]"
                    >
                      <span className="font-mono text-[#aab2f5]">
                        {r.number}
                      </span>
                      <span className="truncate text-[#d0d6e0]">
                        {r.client}
                      </span>
                      <span className="text-right font-mono font-medium text-[#f7f8f8]">
                        {r.total}
                      </span>
                      <span className="flex justify-end">
                        <StatusBadge status={r.status} />
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </WindowFrame>
  );
}

/** Secondary mock: an invoice being composed (used in feature sections). */
export function InvoiceComposerMock({ className }: { className?: string }) {
  const lines = [
    { desc: "Brand strategy & positioning", qty: "1", price: "£6,500.00" },
    { desc: "Website design — 14 screens", qty: "14", price: "£11,200.00" },
    { desc: "Design system & handoff", qty: "1", price: "£3,800.00" },
  ];
  return (
    <WindowFrame className={className} url="app.invoiceflow.com/invoices/new">
      <div className="grid min-h-[420px] grid-cols-1 bg-[#0a0a0b] lg:grid-cols-[1.1fr_1fr]">
        {/* Form side */}
        <div className="border-b border-[#1a1b1e] p-5 lg:border-b-0 lg:border-r">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-semibold tracking-tight text-[#f7f8f8]">
              New Invoice
            </span>
            <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] font-medium text-[#9aa0a8]">
              Draft
            </span>
          </div>

          <div className="mt-4 space-y-3">
            <div>
              <div className="mb-1 text-[10px] uppercase tracking-wide text-[#62666d]">
                Bill to
              </div>
              <div className="flex items-center justify-between rounded-md border border-[#23252a] bg-[#0f1011] px-3 py-2 text-[12px] text-[#d0d6e0]">
                Northwind Studio
                <span className="text-[#62666d]">▾</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <div className="mb-1 text-[10px] uppercase tracking-wide text-[#62666d]">
                  Issue date
                </div>
                <div className="rounded-md border border-[#23252a] bg-[#0f1011] px-3 py-2 text-[12px] text-[#d0d6e0]">
                  23 Jun 2026
                </div>
              </div>
              <div>
                <div className="mb-1 text-[10px] uppercase tracking-wide text-[#62666d]">
                  Due
                </div>
                <div className="rounded-md border border-[#23252a] bg-[#0f1011] px-3 py-2 text-[12px] text-[#d0d6e0]">
                  Net 30
                </div>
              </div>
            </div>

            <div className="rounded-md border border-[#23252a] bg-[#0f1011]">
              {lines.map((l, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between border-b border-[#161719] px-3 py-2 text-[11px] last:border-0"
                >
                  <span className="truncate text-[#d0d6e0]">{l.desc}</span>
                  <span className="ml-3 shrink-0 font-mono text-[#f7f8f8]">
                    {l.price}
                  </span>
                </div>
              ))}
              <div className="flex items-center gap-1.5 px-3 py-2 text-[11px] text-[#828fff]">
                <Plus className="h-3 w-3" /> Add line item
              </div>
            </div>
          </div>
        </div>

        {/* Preview side */}
        <div className="bg-[#08080a] p-5">
          <div className="rounded-lg bg-white p-5 text-black shadow-[0_20px_60px_-30px_rgba(0,0,0,0.8)]">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-[15px] font-bold tracking-tight text-[#5e6ad2]">
                  InvoiceFlow
                </div>
                <div className="mt-0.5 text-[10px] text-neutral-500">
                  Your Company Ltd
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] uppercase tracking-wide text-neutral-400">
                  Invoice
                </div>
                <div className="font-mono text-[12px] font-semibold">
                  INV-2026-185
                </div>
              </div>
            </div>
            <div className="my-4 h-px bg-neutral-100" />
            <div className="space-y-1.5">
              {lines.map((l, i) => (
                <div
                  key={i}
                  className="flex justify-between text-[11px] text-neutral-700"
                >
                  <span className="truncate pr-3">{l.desc}</span>
                  <span className="font-mono">{l.price}</span>
                </div>
              ))}
            </div>
            <div className="my-3 h-px bg-neutral-100" />
            <div className="space-y-1 text-[11px]">
              <div className="flex justify-between text-neutral-500">
                <span>Subtotal</span>
                <span className="font-mono">£21,500.00</span>
              </div>
              <div className="flex justify-between text-neutral-500">
                <span>VAT (20%)</span>
                <span className="font-mono">£4,300.00</span>
              </div>
              <div className="flex justify-between pt-1 text-[13px] font-semibold text-black">
                <span>Total due</span>
                <span className="font-mono">£25,800.00</span>
              </div>
            </div>
          </div>
          <div className="mt-3 flex gap-2">
            <div className="flex flex-1 items-center justify-center gap-1.5 rounded-md bg-[#5e6ad2] py-2 text-[11px] font-medium text-white">
              <Send className="h-3 w-3" /> Send invoice
            </div>
            <div className="flex items-center justify-center rounded-md border border-[#23252a] bg-[#0f1011] px-3 py-2 text-[11px] text-[#d0d6e0]">
              Preview PDF
            </div>
          </div>
        </div>
      </div>
    </WindowFrame>
  );
}

/** Small "automation" mock used in a feature row. */
export function AutomationMock({ className }: { className?: string }) {
  const steps = [
    { icon: Send, label: "Invoice sent", time: "Day 0", done: true },
    { icon: Clock, label: "Reminder scheduled", time: "Day 7", done: true },
    { icon: Bell, label: "Overdue notice", time: "Day 30", done: false },
    { icon: CheckCircle2, label: "Marked paid", time: "Auto", done: false },
  ];
  return (
    <div className={cn("mkt-panel rounded-xl p-5", className)}>
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-medium text-[#d0d6e0]">
          Payment workflow
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[rgba(39,166,68,0.12)] px-2 py-0.5 text-[11px] font-medium text-[#7fe0a0]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#27a644]" /> Active
        </span>
      </div>
      <div className="mt-4 space-y-2.5">
        {steps.map((s, i) => (
          <div
            key={i}
            className="flex items-center gap-3 rounded-lg border border-[#1d1e21] bg-[#0c0c0e] px-3 py-2.5"
          >
            <div
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-md",
                s.done
                  ? "bg-[#5e6ad2]/15 text-[#828fff]"
                  : "bg-white/5 text-[#62666d]"
              )}
            >
              <s.icon className="h-3.5 w-3.5" />
            </div>
            <span className="flex-1 text-[12px] text-[#d0d6e0]">{s.label}</span>
            <span className="font-mono text-[11px] text-[#62666d]">
              {s.time}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
