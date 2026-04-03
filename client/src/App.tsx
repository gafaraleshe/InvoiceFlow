import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import DashboardLayout from "./components/DashboardLayout";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import InvoicesPage from "./pages/Invoices";
import InvoiceDetailPage from "./pages/InvoiceDetail";
import CreateInvoicePage from "./pages/CreateInvoice";
import EditInvoicePage from "./pages/EditInvoice";
import ClientsPage from "./pages/Clients";
import ClientDetailPage from "./pages/ClientDetail";
import CreateClientPage from "./pages/CreateClient";
import EditClientPage from "./pages/EditClient";

function Router() {
  return (
    <DashboardLayout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/invoices" component={InvoicesPage} />
        <Route path="/invoices/new" component={CreateInvoicePage} />
        <Route path="/invoices/:id" component={InvoiceDetailPage} />
        <Route path="/invoices/:id/edit" component={EditInvoicePage} />
        <Route path="/clients" component={ClientsPage} />
        <Route path="/clients/new" component={CreateClientPage} />
        <Route path="/clients/:id" component={ClientDetailPage} />
        <Route path="/clients/:id/edit" component={EditClientPage} />
        <Route path="/404" component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </DashboardLayout>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
