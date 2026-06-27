import { ENV } from "./_core/env";

interface SendInvoiceEmailParams {
  to: string;
  invoiceNumber: string;
  clientName: string;
  total: string;
  dueDate: string | Date;
  pdfUrl: string;
  message?: string;
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

function buildEmailHtml(params: SendInvoiceEmailParams): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: 'Helvetica Neue', Arial, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <div style="background: white; border-radius: 12px; padding: 40px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
      <div style="text-align: center; margin-bottom: 32px;">
        <h1 style="font-size: 24px; font-weight: 700; color: #1e40af; margin: 0;">InvoiceFlow</h1>
      </div>

      <h2 style="font-size: 20px; font-weight: 600; color: #111827; margin: 0 0 16px;">
        Invoice ${params.invoiceNumber}
      </h2>

      <p style="font-size: 15px; color: #4b5563; line-height: 1.6; margin: 0 0 24px;">
        Dear ${params.clientName},
      </p>

      ${
        params.message
          ? `<p style="font-size: 15px; color: #4b5563; line-height: 1.6; margin: 0 0 24px;">${params.message}</p>`
          : `<p style="font-size: 15px; color: #4b5563; line-height: 1.6; margin: 0 0 24px;">
          Please find attached your invoice. A summary is provided below.
        </p>`
      }

      <div style="background: #f9fafb; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; font-size: 14px; color: #6b7280;">Invoice Number</td>
            <td style="padding: 8px 0; font-size: 14px; color: #111827; font-weight: 600; text-align: right;">${params.invoiceNumber}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-size: 14px; color: #6b7280;">Amount Due</td>
            <td style="padding: 8px 0; font-size: 14px; color: #111827; font-weight: 600; text-align: right;">${formatCurrency(params.total)}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-size: 14px; color: #6b7280;">Due Date</td>
            <td style="padding: 8px 0; font-size: 14px; color: #111827; font-weight: 600; text-align: right;">${formatDate(params.dueDate)}</td>
          </tr>
        </table>
      </div>

      <div style="text-align: center; margin-bottom: 24px;">
        <a href="${params.pdfUrl}" style="display: inline-block; background: #1e40af; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: 600;">
          View Invoice
        </a>
      </div>

      <p style="font-size: 13px; color: #9ca3af; text-align: center; margin: 0;">
        This invoice was sent via InvoiceFlow. If you have any questions, please reply to this email.
      </p>
    </div>
  </div>
</body>
</html>`;
}

export async function sendInvoiceEmail(
  params: SendInvoiceEmailParams
): Promise<void> {
  const resendApiKey = process.env.RESEND_API_KEY;

  if (!resendApiKey) {
    console.warn(
      "[Email] RESEND_API_KEY not configured. Email will be simulated."
    );
    console.log(`[Email] Simulated email to ${params.to}:`, {
      subject: `Invoice ${params.invoiceNumber} from InvoiceFlow`,
      invoiceUrl: params.pdfUrl,
    });
    return;
  }

  const html = buildEmailHtml(params);

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from:
        process.env.RESEND_FROM_EMAIL || "InvoiceFlow <invoices@resend.dev>",
      to: [params.to],
      subject: `Invoice ${params.invoiceNumber} — ${formatCurrency(params.total)} due ${formatDate(params.dueDate)}`,
      html,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Resend API error (${response.status}): ${errorBody}`);
  }
}
