import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Plug,
  Webhook,
  KeyRound,
  Lock,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

type Connector = {
  name: string;
  category: string;
  description: string;
  plan: "Business" | "Enterprise";
};

// CRM + integration catalogue. These are stubs today — the marketing site
// advertises them and this surface is where they'll be wired up. Each
// connector declares the minimum plan it ships on so we can gate later.
const connectors: Connector[] = [
  {
    name: "Salesforce",
    category: "CRM",
    description:
      "Two-way sync of accounts, contacts, and opportunities. Paid invoices update the deal.",
    plan: "Enterprise",
  },
  {
    name: "HubSpot",
    category: "CRM",
    description:
      "Sync companies and contacts, and push paid-invoice events into your pipeline.",
    plan: "Enterprise",
  },
  {
    name: "Pipedrive",
    category: "CRM",
    description:
      "Keep clients and deals aligned, with revenue events flowing back to Pipedrive.",
    plan: "Enterprise",
  },
  {
    name: "Zoho CRM",
    category: "CRM",
    description:
      "Connect Zoho contacts and deals so billing and pipeline stay in step.",
    plan: "Enterprise",
  },
];

function connectorBadgeClasses(plan: Connector["plan"]) {
  return plan === "Enterprise"
    ? "border-primary/30 bg-primary/10 text-primary"
    : "border-border bg-muted text-muted-foreground";
}

export default function IntegrationsPage() {
  const notReady = (name: string) =>
    toast("Coming soon", {
      description: `${name} sync is on the Enterprise roadmap. Talk to sales to join the early access list.`,
    });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Integrations</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Connect InvoiceFlow to your CRM and developer tools.
          </p>
        </div>
        <Button asChild size="sm" variant="outline">
          <a href="/docs#api" target="_blank" rel="noreferrer">
            API docs
            <ArrowUpRight className="h-4 w-4 ml-1.5" />
          </a>
        </Button>
      </div>

      {/* Enterprise notice */}
      <Card className="border-primary/30 bg-primary/[0.03]">
        <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Sparkles className="h-[18px] w-[18px]" />
            </div>
            <div>
              <p className="text-sm font-medium">
                CRM sync is an Enterprise feature
              </p>
              <p className="text-muted-foreground text-sm mt-0.5">
                Native, two-way CRM integrations ship on the Enterprise plan.
                Pro and Business can build anything custom on the REST API and
                webhooks below.
              </p>
            </div>
          </div>
          <Button asChild size="sm" className="shrink-0">
            <a href="/contact" target="_blank" rel="noreferrer">
              Talk to sales
            </a>
          </Button>
        </CardContent>
      </Card>

      {/* CRM connectors */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Plug className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold tracking-tight">
            CRM connectors
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {connectors.map(c => (
            <Card key={c.name}>
              <CardContent className="flex h-full flex-col gap-3 p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg border bg-muted text-sm font-semibold">
                      {c.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium leading-none">
                        {c.name}
                      </p>
                      <p className="text-muted-foreground text-xs mt-1">
                        {c.category}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className={connectorBadgeClasses(c.plan)}
                  >
                    {c.plan}
                  </Badge>
                </div>
                <p className="text-muted-foreground text-sm flex-1">
                  {c.description}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => notReady(c.name)}
                >
                  Connect
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Developer tools */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Webhook className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold tracking-tight">
            Developer tools
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Card>
            <CardContent className="flex h-full flex-col gap-3 p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg border bg-muted text-muted-foreground">
                  <KeyRound className="h-[18px] w-[18px]" />
                </div>
                <div>
                  <p className="text-sm font-medium leading-none">API keys</p>
                  <p className="text-muted-foreground text-xs mt-1">
                    Pro &amp; Business
                  </p>
                </div>
              </div>
              <p className="text-muted-foreground text-sm flex-1">
                Create scoped keys to manage clients, invoices, and payments
                over the REST API at <code>/api/v1</code>.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() =>
                  toast("Coming soon", {
                    description:
                      "API key management is landing with the public REST API.",
                  })
                }
              >
                Create key
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex h-full flex-col gap-3 p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg border bg-muted text-muted-foreground">
                  <Webhook className="h-[18px] w-[18px]" />
                </div>
                <div>
                  <p className="text-sm font-medium leading-none">Webhooks</p>
                  <p className="text-muted-foreground text-xs mt-1">
                    Pro &amp; Business
                  </p>
                </div>
              </div>
              <p className="text-muted-foreground text-sm flex-1">
                Subscribe an endpoint to <code>invoice.paid</code> and{" "}
                <code>payment.succeeded</code> events to drive your own
                automations.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() =>
                  toast("Coming soon", {
                    description:
                      "Webhook subscriptions are landing with the public REST API.",
                  })
                }
              >
                Add endpoint
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* SSO */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Lock className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold tracking-tight">
            Security &amp; identity
          </h2>
        </div>
        <Card>
          <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border bg-muted text-muted-foreground">
                <Lock className="h-[18px] w-[18px]" />
              </div>
              <div>
                <p className="text-sm font-medium leading-none">
                  SSO, SAML &amp; SCIM
                </p>
                <p className="text-muted-foreground text-sm mt-1">
                  Single sign-on and automated user provisioning for your whole
                  team.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary">
                Enterprise
              </Badge>
              <Button asChild size="sm" variant="outline">
                <a href="/contact" target="_blank" rel="noreferrer">
                  Talk to sales
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
