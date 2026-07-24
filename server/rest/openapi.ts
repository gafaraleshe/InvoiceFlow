/**
 * OpenAPI 3.0 description of the public REST API. This object is the single
 * source of truth: it is served verbatim at GET /api/v1/openapi.json, and
 * `openapi.yaml` at the repo root is generated from it (pnpm gen:openapi).
 */
export const openapiSpec = {
  openapi: "3.0.3",
  info: {
    title: "HermiteFlow API",
    version: "1.0.0",
    description:
      "Public REST API for managing clients, invoices and billing. " +
      "Authenticate with an API key (`Authorization: Bearer ifk_...`) minted in " +
      "the dashboard under Settings → Integrations.",
  },
  servers: [{ url: "/api/v1" }],
  security: [{ apiKey: [] }],
  tags: [
    { name: "Clients" },
    { name: "Invoices" },
    { name: "Dashboard" },
    { name: "Meta" },
  ],
  paths: {
    "/clients": {
      get: {
        tags: ["Clients"],
        summary: "List clients",
        parameters: [refParam("page"), refParam("limit"), searchParam()],
        responses: {
          "200": paginated("Client"),
          "401": errRef(),
        },
      },
      post: {
        tags: ["Clients"],
        summary: "Create a client",
        requestBody: jsonBody("ClientInput"),
        responses: {
          "201": jsonRef("Client"),
          "400": errRef(),
          "401": errRef(),
        },
      },
    },
    "/clients/{id}": {
      parameters: [idParam()],
      get: {
        tags: ["Clients"],
        summary: "Retrieve a client",
        responses: { "200": jsonRef("Client"), "404": errRef() },
      },
      patch: {
        tags: ["Clients"],
        summary: "Update a client",
        requestBody: jsonBody("ClientInput"),
        responses: { "200": jsonRef("Client"), "404": errRef() },
      },
      delete: {
        tags: ["Clients"],
        summary: "Delete a client",
        responses: {
          "200": jsonInline({
            type: "object",
            properties: { deleted: { type: "boolean" } },
          }),
          "404": errRef(),
          "409": errRef(),
        },
      },
    },
    "/invoices": {
      get: {
        tags: ["Invoices"],
        summary: "List invoices",
        parameters: [
          refParam("page"),
          refParam("limit"),
          {
            name: "status",
            in: "query",
            schema: {
              type: "string",
              enum: ["all", "draft", "sent", "paid", "overdue"],
            },
          },
          { name: "client_id", in: "query", schema: { type: "string", format: "uuid" } },
        ],
        responses: { "200": paginated("Invoice"), "401": errRef() },
      },
      post: {
        tags: ["Invoices"],
        summary: "Create an invoice (totals auto-computed)",
        requestBody: jsonBody("InvoiceInput"),
        responses: {
          "201": jsonRef("Invoice"),
          "400": errRef(),
          "404": errRef(),
        },
      },
    },
    "/invoices/{id}": {
      parameters: [idParam()],
      get: {
        tags: ["Invoices"],
        summary: "Retrieve an invoice",
        responses: { "200": jsonRef("Invoice"), "404": errRef() },
      },
      patch: {
        tags: ["Invoices"],
        summary: "Update an invoice (not allowed once paid)",
        requestBody: jsonBody("InvoiceInput"),
        responses: { "200": jsonRef("Invoice"), "404": errRef(), "409": errRef() },
      },
      delete: {
        tags: ["Invoices"],
        summary: "Delete an invoice (not allowed once paid)",
        responses: {
          "200": jsonInline({
            type: "object",
            properties: { deleted: { type: "boolean" } },
          }),
          "404": errRef(),
          "409": errRef(),
        },
      },
    },
    "/invoices/{id}/send": {
      parameters: [idParam()],
      post: {
        tags: ["Invoices"],
        summary: "Email the invoice to the client",
        requestBody: {
          required: false,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  to: { type: "string", format: "email" },
                  message: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          "200": jsonInline({
            type: "object",
            properties: {
              success: { type: "boolean" },
              sentTo: { type: "string" },
            },
          }),
          "404": errRef(),
        },
      },
    },
    "/invoices/{id}/pdf": {
      parameters: [idParam()],
      post: {
        tags: ["Invoices"],
        summary: "Generate the invoice PDF",
        responses: {
          "200": jsonInline({
            type: "object",
            properties: { pdfPath: { type: "string" } },
          }),
          "404": errRef(),
        },
      },
    },
    "/dashboard/stats": {
      get: {
        tags: ["Dashboard"],
        summary: "Revenue + outstanding + counts for the key's organization",
        responses: { "200": jsonRef("DashboardStats"), "401": errRef() },
      },
    },
    "/me": {
      get: {
        tags: ["Meta"],
        summary: "The organization this key belongs to",
        responses: { "200": jsonRef("Me") },
      },
    },
    "/openapi.json": {
      get: {
        tags: ["Meta"],
        summary: "This OpenAPI document",
        security: [],
        responses: { "200": jsonInline({ type: "object" }) },
      },
    },
  },
  components: {
    securitySchemes: {
      apiKey: { type: "http", scheme: "bearer", bearerFormat: "ifk_..." },
    },
    parameters: {
      page: {
        name: "page",
        in: "query",
        schema: { type: "integer", minimum: 1, default: 1 },
      },
      limit: {
        name: "limit",
        in: "query",
        schema: { type: "integer", minimum: 1, maximum: 100, default: 25 },
      },
    },
    schemas: {
      Error: {
        type: "object",
        properties: {
          error: {
            type: "object",
            properties: {
              code: { type: "string" },
              message: { type: "string" },
              details: {},
            },
            required: ["code", "message"],
          },
        },
      },
      ClientInput: {
        type: "object",
        required: ["name", "email"],
        properties: {
          name: { type: "string" },
          email: { type: "string", format: "email" },
          company: { type: "string", nullable: true },
          addressLine1: { type: "string", nullable: true },
          addressLine2: { type: "string", nullable: true },
          city: { type: "string", nullable: true },
          postcode: { type: "string", nullable: true },
          country: { type: "string", nullable: true },
          phone: { type: "string", nullable: true },
          paymentTerms: { type: "integer", default: 30 },
          notes: { type: "string", nullable: true },
        },
      },
      Client: {
        allOf: [
          { $ref: "#/components/schemas/ClientInput" },
          {
            type: "object",
            properties: {
              id: { type: "string", format: "uuid" },
              createdAt: { type: "string", format: "date-time" },
            },
          },
        ],
      },
      LineItemInput: {
        type: "object",
        required: ["description", "quantity", "unit_price"],
        properties: {
          description: { type: "string" },
          quantity: { type: "number" },
          unit_price: { type: "number" },
        },
      },
      InvoiceInput: {
        type: "object",
        required: ["client_id", "line_items"],
        properties: {
          client_id: { type: "string", format: "uuid" },
          issue_date: {
            type: "string",
            format: "date",
            description: "ISO date; defaults to today",
          },
          due_date: { type: "string", format: "date" },
          tax_rate: { type: "number", default: 20 },
          notes: { type: "string", nullable: true },
          line_items: {
            type: "array",
            items: { $ref: "#/components/schemas/LineItemInput" },
          },
        },
      },
      Invoice: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          number: { type: "string" },
          status: {
            type: "string",
            enum: ["draft", "sent", "paid", "overdue", "void"],
          },
          currency: { type: "string" },
          issueDate: { type: "string", format: "date" },
          dueDate: { type: "string", format: "date" },
          subtotal: { type: "string" },
          taxRate: { type: "string" },
          taxAmount: { type: "string" },
          total: { type: "string" },
          createdAt: { type: "string", format: "date-time" },
        },
      },
      DashboardStats: {
        type: "object",
        properties: {
          totalRevenue: { type: "number" },
          outstanding: { type: "number" },
          overdueCount: { type: "integer" },
          paidCount: { type: "integer" },
          clientCount: { type: "integer" },
          invoiceCount: { type: "integer" },
        },
      },
      Me: {
        type: "object",
        properties: {
          organization: {
            type: "object",
            properties: {
              id: { type: "string", format: "uuid" },
              name: { type: "string" },
            },
          },
          role: { type: "string" },
        },
      },
    },
  },
} as const;

// ── tiny builders to keep the paths block readable ──
function refParam(name: string) {
  return { $ref: `#/components/parameters/${name}` };
}
function searchParam() {
  return { name: "search", in: "query", schema: { type: "string" } };
}
function idParam() {
  return {
    name: "id",
    in: "path",
    required: true,
    schema: { type: "string", format: "uuid" },
  };
}
function jsonRef(schema: string) {
  return {
    description: "OK",
    content: {
      "application/json": { schema: { $ref: `#/components/schemas/${schema}` } },
    },
  };
}
function jsonInline(schema: object) {
  return { description: "OK", content: { "application/json": { schema } } };
}
function jsonBody(schema: string) {
  return {
    required: true,
    content: {
      "application/json": { schema: { $ref: `#/components/schemas/${schema}` } },
    },
  };
}
function errRef() {
  return {
    description: "Error",
    content: {
      "application/json": { schema: { $ref: "#/components/schemas/Error" } },
    },
  };
}
function paginated(item: string) {
  return {
    description: "OK",
    content: {
      "application/json": {
        schema: {
          type: "object",
          properties: {
            data: {
              type: "array",
              items: { $ref: `#/components/schemas/${item}` },
            },
            page: { type: "integer" },
            limit: { type: "integer" },
            total: { type: "integer" },
            total_pages: { type: "integer" },
          },
        },
      },
    },
  };
}
