import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Plug,
  Webhook,
  KeyRound,
  Lock,
  ArrowUpRight,
  Sparkles,
  Copy,
  Check,
  Trash2,
  Terminal,
  CalendarCheck,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

/*
 * Integrations — the "connection tool" for Hermite Flow.
 *
 * The connect panel is styled after the Composio design reference
 * (composio/DESIGN.md): a dark, technical surface with an electric-blue
 * voltage (#0007cd), a terminal-style code panel, and JetBrains Mono. It sits
 * inside the normal (theme-aware) dashboard but deliberately commits to the
 * dark developer aesthetic for the connect flow.
 */

// ── Composio-inspired tokens (see composio/DESIGN.md) ──────────────────────
const CX = {
  canvas: "#0f0f0f",
  card: "#181818",
  cardElevated: "#222222",
  hairline: "#2a2a2a",
  primary: "#0007cd",
  primaryGlow: "#1a26ff",
  ink: "#ffffff",
  body: "#a8a8a8",
  muted: "#888888",
  cyan: "#00d4ff",
  success: "#33d17a",
};

const MONO =
  "'JetBrains Mono', 'Fira Code', ui-monospace, SFMono-Regular, monospace";

function CopyButton({ text, label = "Copy" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        toast.success("Copied to clipboard");
        setTimeout(() => setCopied(false), 1500);
      }}
      className="inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-[12px] font-medium transition-colors"
      style={{
        borderColor: CX.hairline,
        color: copied ? CX.success : CX.body,
        background: "transparent",
      }}
    >
      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
      {copied ? "Copied" : label}
    </button>
  );
}

/** A dark, Composio-style terminal panel. */
function TerminalPanel({
  title,
  lines,
  copyText,
}: {
  title: string;
  lines: { text: string; tone?: "cmd" | "out" | "comment" }[];
  copyText: string;
}) {
  const tone = (t?: string) =>
    t === "comment" ? CX.muted : t === "out" ? CX.cyan : CX.ink;
  return (
    <div
      className="overflow-hidden rounded-xl border"
      style={{ borderColor: CX.hairline, background: CX.canvas }}
    >
      <div
        className="flex items-center justify-between border-b px-4 py-2.5"
        style={{ borderColor: CX.hairline }}
      >
        <div className="flex items-center gap-2">
          <span className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: "#ff5f56" }} />
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: "#ffbd2e" }} />
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: "#27c93f" }} />
          </span>
          <span
            className="ml-2 text-[12px]"
            style={{ color: CX.muted, fontFamily: MONO }}
          >
            {title}
          </span>
        </div>
        <CopyButton text={copyText} />
      </div>
      <pre
        className="overflow-x-auto px-4 py-3.5 text-[12.5px] leading-relaxed"
        style={{ fontFamily: MONO }}
      >
        {lines.map((l, i) => (
          <div key={i} style={{ color: tone(l.tone) }}>
            {l.tone === "cmd" ? (
              <span style={{ color: CX.primaryGlow }}>$ </span>
            ) : null}
            {l.text}
          </div>
        ))}
      </pre>
    </div>
  );
}

export default function IntegrationsPage() {
  const utils = trpc.useUtils();
  const { data: keys, isLoading: keysLoading } = trpc.apiKeys.list.useQuery();
  const [createOpen, setCreateOpen] = useState(false);
  const [newKey, setNewKey] = useState<string | null>(null);

  const origin =
    typeof window !== "undefined" ? window.location.origin : "https://YOURDOMAIN";

  const revoke = trpc.apiKeys.revoke.useMutation({
    onSuccess: () => {
      toast.success("API key revoked");
      utils.apiKeys.list.invalidate();
    },
    onError: err => toast.error(err.message),
  });

  const activeKeys = (keys ?? []).filter((k: any) => !k.revokedAt);
  const hasOwnerKey = activeKeys.some((k: any) =>
    (k.scopes ?? []).includes("owner")
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Integrations</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Connect your booking site to Hermite Flow — enquiries become clients
            and invoices automatically.
          </p>
        </div>
        <Button asChild size="sm" variant="outline">
          <a href="/docs#api" target="_blank" rel="noreferrer">
            API docs
            <ArrowUpRight className="h-4 w-4 ml-1.5" />
          </a>
        </Button>
      </div>

      {/* ── Composio-style connect hero ── */}
      <div
        className="relative overflow-hidden rounded-2xl border p-6 sm:p-8"
        style={{ borderColor: CX.hairline, background: CX.canvas }}
      >
        {/* central blue spotlight glow — Composio's signature */}
        <div
          className="pointer-events-none absolute -top-24 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full opacity-40 blur-3xl"
          style={{ background: CX.primaryGlow }}
        />
        <div className="relative">
          <div className="mb-4 flex items-center gap-2">
            <span
              className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-widest"
              style={{ borderColor: CX.hairline, color: CX.cyan }}
            >
              <Terminal className="h-3.5 w-3.5" />
              Connect
            </span>
            {hasOwnerKey ? (
              <span
                className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-widest"
                style={{ borderColor: CX.hairline, color: CX.success }}
              >
                <Sparkles className="h-3.5 w-3.5" />
                Owner access
              </span>
            ) : null}
          </div>
          <h2
            className="text-2xl font-medium tracking-tight sm:text-3xl"
            style={{ color: CX.ink, letterSpacing: "-0.96px" }}
          >
            One command to connect a booking site
          </h2>
          <p className="mt-2 max-w-xl text-sm" style={{ color: CX.body }}>
            Create an API key, then point your site at Hermite Flow. Every booking
            posts to <code style={{ color: CX.cyan }}>/api/v1/bookings</code> and,
            with <code style={{ color: CX.cyan }}>auto_send</code>, an invoice is
            emailed via Resend on the spot.
          </p>

          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <TerminalPanel
              title="connect.sh"
              copyText={`npx @invoiceflow/connect --url ${origin} --key ifk_live_xxx`}
              lines={[
                { text: "Verify a key and print your ready-to-paste config:", tone: "comment" },
                { text: `npx @invoiceflow/connect \\`, tone: "cmd" },
                { text: `    --url ${origin} \\`, tone: "cmd" },
                { text: "    --key ifk_live_xxx", tone: "cmd" },
                { text: "✓ authenticated as your workspace (owner)", tone: "out" },
                { text: "✓ wrote .env.invoiceflow", tone: "out" },
              ]}
            />
            <TerminalPanel
              title="create a booking (curl)"
              copyText={`curl -X POST ${origin}/api/v1/bookings \\\n  -H "Authorization: Bearer ifk_live_xxx" \\\n  -H "Content-Type: application/json" \\\n  -d '{"name":"Ada","email":"ada@example.com","service_type":"Wedding","amount":1200,"auto_send":true}'`}
              lines={[
                { text: `curl -X POST ${origin}/api/v1/bookings \\`, tone: "cmd" },
                { text: `  -H "Authorization: Bearer ifk_live_xxx" \\`, tone: "cmd" },
                { text: `  -d '{`, tone: "cmd" },
                { text: `    "name": "Ada Lovelace",`, tone: "cmd" },
                { text: `    "email": "ada@example.com",`, tone: "cmd" },
                { text: `    "service_type": "Wedding",`, tone: "cmd" },
                { text: `    "amount": 1200,`, tone: "cmd" },
                { text: `    "auto_send": true }'`, tone: "cmd" },
                { text: "→ 201 booking created · invoice emailed", tone: "out" },
              ]}
            />
          </div>
        </div>
      </div>

      {/* ── API keys (functional) ── */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <KeyRound className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold tracking-tight">API keys</h2>
          </div>
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            Create key
          </Button>
        </div>

        <Card>
          <CardContent className="p-0">
            {keysLoading ? (
              <div className="p-6 text-sm text-muted-foreground">Loading…</div>
            ) : activeKeys.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <KeyRound className="mx-auto mb-3 h-8 w-8 opacity-40" />
                <p className="text-sm font-medium">No API keys yet</p>
                <p className="mt-1 text-xs">
                  Create one to connect your booking site or the MCP server.
                </p>
              </div>
            ) : (
              <div className="divide-y">
                {activeKeys.map((k: any) => (
                  <div
                    key={k.id}
                    className="flex items-center justify-between gap-4 px-5 py-3.5"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{k.name}</p>
                      <p className="font-mono text-xs text-muted-foreground">
                        {k.prefix}…{" "}
                        {(k.scopes ?? []).includes("owner") ? (
                          <Badge
                            variant="outline"
                            className="ml-1 border-primary/30 bg-primary/10 text-primary"
                          >
                            owner
                          </Badge>
                        ) : null}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => revoke.mutate({ id: k.id })}
                    >
                      <Trash2 className="mr-1.5 h-4 w-4" />
                      Revoke
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      {/* ── Connectors ── */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Plug className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold tracking-tight">Connectors</h2>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* SHOTBYGAFAR — first-class, owner-connected */}
          <Card className="border-primary/30">
            <CardContent className="flex h-full flex-col gap-3 p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <CalendarCheck className="h-[18px] w-[18px]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium leading-none">SHOTBYGAFAR</p>
                    <p className="text-muted-foreground text-xs mt-1">
                      Booking site
                    </p>
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className={
                    hasOwnerKey
                      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      : "border-border bg-muted text-muted-foreground"
                  }
                >
                  {hasOwnerKey ? "Connected" : "Owner"}
                </Badge>
              </div>
              <p className="text-muted-foreground text-sm flex-1">
                Bookings flow straight into your CRM and become invoices. This is
                your own site — it ships with full owner access.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => setCreateOpen(true)}
              >
                {hasOwnerKey ? "Manage owner key" : "Create owner key"}
              </Button>
            </CardContent>
          </Card>

          {/* MCP server */}
          <Card>
            <CardContent className="flex h-full flex-col gap-3 p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg border bg-muted text-muted-foreground">
                  <Terminal className="h-[18px] w-[18px]" />
                </div>
                <div>
                  <p className="text-sm font-medium leading-none">MCP server</p>
                  <p className="text-muted-foreground text-xs mt-1">
                    Claude / AI agents
                  </p>
                </div>
              </div>
              <p className="text-muted-foreground text-sm flex-1">
                Manage clients, invoices and bookings from Claude in natural
                language, over the same REST API.
              </p>
              <Button asChild variant="outline" size="sm" className="w-full">
                <a href="/docs#mcp" target="_blank" rel="noreferrer">
                  Setup guide
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Webhooks / SSO (roadmap) */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Webhook className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold tracking-tight">Developer tools</h2>
        </div>
        <Card>
          <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border bg-muted text-muted-foreground">
                <Webhook className="h-[18px] w-[18px]" />
              </div>
              <div>
                <p className="text-sm font-medium leading-none">Webhooks</p>
                <p className="text-muted-foreground text-sm mt-1">
                  Subscribe to <code>invoice.paid</code> and{" "}
                  <code>booking.created</code> to drive your own automations.
                </p>
              </div>
            </div>
            <Badge variant="outline" className="border-border bg-muted text-muted-foreground">
              Roadmap
            </Badge>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border bg-muted text-muted-foreground">
                <Lock className="h-[18px] w-[18px]" />
              </div>
              <div>
                <p className="text-sm font-medium leading-none">SSO, SAML &amp; SCIM</p>
                <p className="text-muted-foreground text-sm mt-1">
                  Single sign-on and automated provisioning for your whole team.
                </p>
              </div>
            </div>
            <Button asChild size="sm" variant="outline">
              <a href="/contact" target="_blank" rel="noreferrer">
                Talk to sales
              </a>
            </Button>
          </CardContent>
        </Card>
      </section>

      <CreateKeyDialog
        open={createOpen}
        onOpenChange={o => {
          setCreateOpen(o);
          if (!o) setNewKey(null);
        }}
        onCreated={key => setNewKey(key)}
        createdKey={newKey}
      />
    </div>
  );
}

function CreateKeyDialog({
  open,
  onOpenChange,
  onCreated,
  createdKey,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onCreated: (key: string) => void;
  createdKey: string | null;
}) {
  const utils = trpc.useUtils();
  const [name, setName] = useState("");
  const [owner, setOwner] = useState(true);

  const create = trpc.apiKeys.create.useMutation({
    onSuccess: res => {
      onCreated(res.key);
      utils.apiKeys.list.invalidate();
    },
    onError: err => toast.error(err.message),
  });

  const scopes = useMemo(
    () => (owner ? (["owner"] as ("owner")[]) : undefined),
    [owner]
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create API key</DialogTitle>
          <DialogDescription>
            The full key is shown once. Store it somewhere safe — we only keep a
            hash.
          </DialogDescription>
        </DialogHeader>

        {createdKey ? (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Copy your key now — you won&apos;t see it again.
            </p>
            <div className="flex items-center gap-2 rounded-lg border bg-muted/40 p-3">
              <code className="flex-1 overflow-x-auto font-mono text-xs">
                {createdKey}
              </code>
              <CopyButton text={createdKey} />
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-sm font-medium">Name</label>
              <Input
                placeholder="e.g. SHOTBYGAFAR booking site"
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={owner}
                onChange={e => setOwner(e.target.checked)}
                className="h-4 w-4 rounded border-border"
              />
              Grant <strong>owner</strong> (special) access — full capabilities
              for your own sites
            </label>
          </div>
        )}

        <DialogFooter>
          {createdKey ? (
            <Button onClick={() => onOpenChange(false)}>Done</Button>
          ) : (
            <>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button
                disabled={!name.trim() || create.isPending}
                onClick={() => create.mutate({ name: name.trim(), scopes })}
              >
                {create.isPending ? "Creating…" : "Create key"}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
