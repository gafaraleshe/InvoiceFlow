import { describe, expect, it, vi } from "vitest";
import { ApiError, SigmaClient } from "./client.js";

function mockFetch(response: {
  ok: boolean;
  status: number;
  body: unknown;
}) {
  return vi.fn(async () => ({
    ok: response.ok,
    status: response.status,
    statusText: "",
    text: async () => JSON.stringify(response.body),
  })) as unknown as typeof fetch;
}

describe("SigmaClient", () => {
  it("appends /api/v1 to a bare origin and sends the bearer key", async () => {
    const fetchImpl = mockFetch({ ok: true, status: 200, body: { data: [] } });
    const client = new SigmaClient({
      baseUrl: "https://example.com/",
      apiKey: "ifk_test_123",
      fetchImpl,
    });
    await client.listClients({ page: 2, limit: 10 });

    const [url, init] = (fetchImpl as unknown as ReturnType<typeof vi.fn>).mock
      .calls[0];
    expect(url).toBe("https://example.com/api/v1/clients?page=2&limit=10");
    expect((init as RequestInit).headers).toMatchObject({
      authorization: "Bearer ifk_test_123",
    });
  });

  it("does not double-append /api/v1 if already present", async () => {
    const fetchImpl = mockFetch({ ok: true, status: 200, body: {} });
    const client = new SigmaClient({
      baseUrl: "https://example.com/api/v1",
      apiKey: "k",
      fetchImpl,
    });
    await client.getDashboardStats();
    const [url] = (fetchImpl as unknown as ReturnType<typeof vi.fn>).mock
      .calls[0];
    expect(url).toBe("https://example.com/api/v1/dashboard/stats");
  });

  it("throws a typed ApiError on non-2xx responses", async () => {
    const fetchImpl = mockFetch({
      ok: false,
      status: 404,
      body: { error: { code: "not_found", message: "Client not found" } },
    });
    const client = new SigmaClient({
      baseUrl: "https://example.com",
      apiKey: "k",
      fetchImpl,
    });
    await expect(client.getClient("missing")).rejects.toMatchObject({
      status: 404,
      code: "not_found",
    });
    await expect(client.getClient("missing")).rejects.toBeInstanceOf(ApiError);
  });
});
