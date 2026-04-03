# InvoiceFlow - Project TODO

## Database & Schema
- [x] Define clients table (name, email, company, address, payment terms)
- [x] Define invoices table (number, status, dates, subtotal, VAT, total, notes)
- [x] Define line_items table (description, quantity, unit_price, amount)
- [x] Define proper foreign key relationships and indexes
- [x] Run database migrations

## Server - Clients CRUD
- [x] List all clients (with pagination/search)
- [x] Get single client by ID
- [x] Create new client with Zod validation
- [x] Update client with Zod validation
- [x] Delete client

## Server - Invoices CRUD
- [x] List all invoices (with filters: status, client, date range)
- [x] Get single invoice by ID (with line items)
- [x] Create new invoice with line items and auto VAT calculation
- [x] Update invoice with line items
- [x] Delete invoice
- [x] Update invoice status (draft, sent, paid, overdue)
- [x] Auto-generate invoice number (INV-YYYY-NNN)
- [x] Overdue flagging logic

## PDF Generation
- [x] Generate PDF invoice with HTML template
- [x] Include company details, client details, line items, VAT breakdown
- [x] Store generated PDF in S3 storage

## Email Integration
- [x] Send invoice email via Resend with PDF attachment
- [x] Email template with invoice summary

## Authentication & Authorization
- [x] OAuth 2.0 authentication (using existing Manus OAuth)
- [x] Role-based access control (admin/viewer)
- [x] Admin-only procedures for create/update/delete
- [x] Viewer read-only access
- [x] Rate limiting via protected procedures

## Frontend - Dashboard
- [x] Dashboard with summary stats (total revenue, outstanding, overdue count)
- [x] Recent invoices table
- [x] Quick action buttons

## Frontend - Invoices
- [x] Invoices list page with status filters and search
- [x] Create invoice form with dynamic line items
- [x] Edit invoice form
- [x] Invoice detail view with VAT breakdown
- [x] Download PDF button
- [x] Send email button
- [x] Status update actions (mark paid)

## Frontend - Clients
- [x] Clients list page with search
- [x] Create client form
- [x] Edit client form
- [x] Client detail view with invoice history
- [x] Delete client (with invoice check)
- [x] Sidebar navigation and responsive design

## API Documentation
- [x] API documentation via tRPC panel (built-in)

## Testing
- [x] VAT calculation unit tests (10 tests)
- [x] Invoice CRUD endpoint tests
- [x] Client CRUD endpoint tests
- [x] Authentication flow tests (4 tests)
- [x] Role-based access control tests (5 tests)
- [x] Input validation tests (8 tests)
- [x] Line item calculation tests (6 tests)

## DevOps
- [x] Docker Compose configuration (API + PostgreSQL)
- [x] GitHub Actions CI/CD pipeline (lint, test, build, docker)
- [x] Dockerfile for the API (multi-stage build)
- [x] .dockerignore file
