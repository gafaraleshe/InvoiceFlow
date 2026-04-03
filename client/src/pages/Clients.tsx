import { trpc } from "@/lib/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Search, Users } from "lucide-react";
import { useState, useMemo } from "react";
import { useLocation } from "wouter";

export default function ClientsPage() {
  const [, setLocation] = useLocation();
  const [search, setSearch] = useState("");

  const queryInput = useMemo(() => ({
    search: search || undefined,
    limit: 50,
    offset: 0,
  }), [search]);

  const { data, isLoading } = trpc.clients.list.useQuery(queryInput);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Clients</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage your client directory
          </p>
        </div>
        <Button onClick={() => setLocation("/clients/new")} size="sm">
          <Plus className="h-4 w-4 mr-1.5" />
          New Client
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search clients..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : !data || data.items.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="h-10 w-10 mx-auto mb-3 opacity-40" />
              <p className="text-sm font-medium">No clients found</p>
              <p className="text-xs mt-1">Add your first client to get started</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/30">
                    {["Name", "Email", "Company", "Payment Terms", "City"].map((h) => (
                      <th
                        key={h}
                        className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider py-3 px-4"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((client: any) => (
                    <tr
                      key={client.id}
                      className="border-b last:border-0 hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => setLocation(`/clients/${client.id}`)}
                    >
                      <td className="py-3 px-4 text-sm font-medium">{client.name}</td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">{client.email}</td>
                      <td className="py-3 px-4 text-sm">{client.company || "—"}</td>
                      <td className="py-3 px-4 text-sm">{client.paymentTerms} days</td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">{client.city || "—"}</td>
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
