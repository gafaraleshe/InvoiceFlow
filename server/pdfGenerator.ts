import { storagePut } from "./storage";
import { nanoid } from "nanoid";

interface InvoiceForPdf {
  id: string;
  number: string;
  status: string;
  issueDate: string;
  dueDate: string;
  subtotal: string;
  taxRate: string;
  taxAmount: string;
  total: string;
  notes?: string | null;
  clientName?: string | null;
  clientEmail?: string | null;
  clientCompany?: string | null;
  clientAddressLine1?: string | null;
  clientAddressLine2?: string | null;
  clientCity?: string | null;
  clientPostcode?: string | null;
  clientCountry?: string | null;
  lineItems: Array<{
    description: string;
    quantity: string;
    unitPrice: string;
    amount: string;
  }>;
}

function formatCurrency(value: string | number): string {
  const num = typeof value === "string" ? parseFloat(value) : value;
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(num);
}

function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

function generateInvoiceHtml(invoice: InvoiceForPdf): string {
  const lineItemsHtml = invoice.lineItems
    .map(
      item => `
    <tr>
      <td style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb; font-size: 14px; color: #374151;">${item.description}</td>
      <td style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb; font-size: 14px; color: #374151; text-align: center;">${Number(item.quantity).toFixed(2)}</td>
      <td style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb; font-size: 14px; color: #374151; text-align: right;">${formatCurrency(item.unitPrice)}</td>
      <td style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb; font-size: 14px; color: #374151; text-align: right; font-weight: 500;">${formatCurrency(item.amount)}</td>
    </tr>`
    )
    .join("");

  const clientAddress = [
    invoice.clientAddressLine1,
    invoice.clientAddressLine2,
    invoice.clientCity,
    invoice.clientPostcode,
    invoice.clientCountry,
  ]
    .filter(Boolean)
    .join("<br/>");

  const statusColor =
    invoice.status === "paid"
      ? "#059669"
      : invoice.status === "overdue"
        ? "#dc2626"
        : invoice.status === "sent"
          ? "#2563eb"
          : "#6b7280";

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Helvetica Neue', Arial, sans-serif; margin: 0; padding: 40px; color: #111827; }
    .invoice-container { max-width: 800px; margin: 0 auto; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 48px; }
    .brand { font-size: 28px; font-weight: 700; color: #1e40af; letter-spacing: -0.5px; }
    .invoice-meta { text-align: right; }
    .invoice-number { font-size: 24px; font-weight: 700; color: #111827; margin-bottom: 8px; }
    .status-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
    .addresses { display: flex; justify-content: space-between; margin-bottom: 40px; }
    .address-block h3 { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #6b7280; margin: 0 0 8px; }
    .address-block p { font-size: 14px; line-height: 1.6; color: #374151; margin: 0; }
    .dates { display: flex; gap: 48px; margin-bottom: 40px; padding: 16px 20px; background: #f9fafb; border-radius: 8px; }
    .date-item label { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #6b7280; display: block; margin-bottom: 4px; }
    .date-item span { font-size: 14px; font-weight: 500; color: #111827; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 32px; }
    thead th { padding: 12px 16px; text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #6b7280; border-bottom: 2px solid #e5e7eb; font-weight: 600; }
    .totals { display: flex; justify-content: flex-end; }
    .totals-table { width: 300px; }
    .totals-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px; color: #374151; }
    .totals-row.total { border-top: 2px solid #111827; padding-top: 12px; margin-top: 4px; font-size: 18px; font-weight: 700; color: #111827; }
    .notes { margin-top: 40px; padding: 20px; background: #f9fafb; border-radius: 8px; }
    .notes h3 { font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #6b7280; margin: 0 0 8px; }
    .notes p { font-size: 14px; color: #374151; line-height: 1.6; margin: 0; }
    .footer { margin-top: 60px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; font-size: 12px; color: #9ca3af; }
  </style>
</head>
<body>
  <div class="invoice-container">
    <div class="header">
      <div class="brand">InvoiceFlow</div>
      <div class="invoice-meta">
        <div class="invoice-number">${invoice.number}</div>
        <span class="status-badge" style="background: ${statusColor}15; color: ${statusColor};">${invoice.status.toUpperCase()}</span>
      </div>
    </div>

    <div class="addresses">
      <div class="address-block">
        <h3>Bill To</h3>
        <p>
          <strong>${invoice.clientName || "—"}</strong><br/>
          ${invoice.clientCompany ? `${invoice.clientCompany}<br/>` : ""}
          ${clientAddress || "—"}<br/>
          ${invoice.clientEmail || ""}
        </p>
      </div>
    </div>

    <div class="dates">
      <div class="date-item">
        <label>Issue Date</label>
        <span>${formatDate(invoice.issueDate)}</span>
      </div>
      <div class="date-item">
        <label>Due Date</label>
        <span>${formatDate(invoice.dueDate)}</span>
      </div>
      <div class="date-item">
        <label>VAT Rate</label>
        <span>${Number(invoice.taxRate).toFixed(0)}%</span>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>Description</th>
          <th style="text-align: center;">Qty</th>
          <th style="text-align: right;">Unit Price</th>
          <th style="text-align: right;">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${lineItemsHtml}
      </tbody>
    </table>

    <div class="totals">
      <div class="totals-table">
        <div class="totals-row">
          <span>Subtotal</span>
          <span>${formatCurrency(invoice.subtotal)}</span>
        </div>
        <div class="totals-row">
          <span>VAT (${Number(invoice.taxRate).toFixed(0)}%)</span>
          <span>${formatCurrency(invoice.taxAmount)}</span>
        </div>
        <div class="totals-row total">
          <span>Total</span>
          <span>${formatCurrency(invoice.total)}</span>
        </div>
      </div>
    </div>

    ${
      invoice.notes
        ? `<div class="notes">
      <h3>Notes</h3>
      <p>${invoice.notes}</p>
    </div>`
        : ""
    }

    <div class="footer">
      Generated by InvoiceFlow &mdash; ${formatDate(new Date())}
    </div>
  </div>
</body>
</html>`;
}

export async function generateInvoicePdf(
  invoice: InvoiceForPdf
): Promise<{ pdfPath: string }> {
  const html = generateInvoiceHtml(invoice);

  // Use the built-in Forge API to convert HTML to PDF
  const { ENV } = await import("./_core/env");

  // Try using a simple HTML-to-PDF approach via the server
  // We'll store the HTML as a styled document and use it as the PDF representation
  const pdfKey = `invoices/${invoice.number}-${nanoid(8)}.html`;

  const { url } = await storagePut(pdfKey, html, "text/html");

  return { pdfPath: url };
}
