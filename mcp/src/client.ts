/**
 * Thin HTTP client for the Sigma public REST API (`/api/v1`).
 * The MCP tools talk to the deployed API over HTTP with an API key — they do
 * not import server code, so this package stays independently deployable.
 */
export interface ClientConfig {
  baseUrl: string; // site origin, e.g. https://invoice-flow-teal.vercel.app
  apiKey: string; // ifk_live_… / ifk_test_…
  fetchImpl?: typeof fetch;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export class SigmaClient {
  private readonly base: string;
  private readonly apiKey: string;
  private readonly doFetch: typeof fetch;

  constructor(cfg: ClientConfig) {
    // Accept either the site origin or a URL that already ends in /api/v1.
    const trimmed = cfg.baseUrl.replace(/\/+$/, "");
    this.base = trimmed.endsWith("/api/v1") ? trimmed : `${trimmed}/api/v1`;
    this.apiKey = cfg.apiKey;
    this.doFetch = cfg.fetchImpl ?? fetch;
  }

  private async request<T>(
    method: string,
    path: string,
    body?: unknown,
    query?: Record<string, unknown>
  ): Promise<T> {
    const qs = query
      ? "?" +
        new URLSearchParams(
          Object.entries(query)
            .filter(([, v]) => v !== undefined && v !== null && v !== "")
            .map(([k, v]) => [k, String(v)])
        ).toString()
      : "";
    const res = await this.doFetch(`${this.base}${path}${qs}`, {
      method,
      headers: {
        authorization: `Bearer ${this.apiKey}`,
        ...(body ? { "content-type": "application/json" } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    const text = await res.text();
    let json: unknown = null;
    try {
      json = text ? JSON.parse(text) : null;
    } catch {
      json = text;
    }
    if (!res.ok) {
      const err = (json as { error?: { code?: string; message?: string } })
        ?.error;
      throw new ApiError(
        res.status,
        err?.code ?? "http_error",
        err?.message ?? `Request failed with status ${res.status}`
      );
    }
    return json as T;
  }

  // ── Clients ──
  listClients(q: { page?: number; limit?: number; search?: string }) {
    return this.request("GET", "/clients", undefined, q);
  }
  getClient(id: string) {
    return this.request("GET", `/clients/${id}`);
  }
  createClient(body: unknown) {
    return this.request("POST", "/clients", body);
  }
  updateClient(id: string, body: unknown) {
    return this.request("PATCH", `/clients/${id}`, body);
  }
  deleteClient(id: string) {
    return this.request("DELETE", `/clients/${id}`);
  }

  // ── Invoices ──
  listInvoices(q: {
    page?: number;
    limit?: number;
    status?: string;
    client_id?: string;
  }) {
    return this.request("GET", "/invoices", undefined, q);
  }
  getInvoice(id: string) {
    return this.request("GET", `/invoices/${id}`);
  }
  createInvoice(body: unknown) {
    return this.request("POST", "/invoices", body);
  }
  updateInvoice(id: string, body: unknown) {
    return this.request("PATCH", `/invoices/${id}`, body);
  }
  deleteInvoice(id: string) {
    return this.request("DELETE", `/invoices/${id}`);
  }
  sendInvoice(id: string, body: { to?: string; message?: string }) {
    return this.request("POST", `/invoices/${id}/send`, body);
  }
  generateInvoicePdf(id: string) {
    return this.request("POST", `/invoices/${id}/pdf`);
  }

  // ── Bookings (CRM) ──
  listBookings(q: { page?: number; limit?: number; status?: string; search?: string }) {
    return this.request("GET", "/bookings", undefined, q);
  }
  getBooking(id: string) {
    return this.request("GET", `/bookings/${id}`);
  }
  createBooking(body: unknown) {
    return this.request("POST", "/bookings", body);
  }
  updateBookingStatus(id: string, status: string) {
    return this.request("PATCH", `/bookings/${id}`, { status });
  }
  convertBooking(id: string, body: { amount?: number; send?: boolean }) {
    return this.request("POST", `/bookings/${id}/convert`, body);
  }
  getBookingStats() {
    return this.request("GET", "/bookings/stats");
  }

  // ── Dashboard ──
  getDashboardStats() {
    return this.request("GET", "/dashboard/stats");
  }
}
