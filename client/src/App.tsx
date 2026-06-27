import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, useLocation } from "wouter";
import { useEffect } from "react";
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
import MarketingLayout from "./marketing/MarketingLayout";
import Landing from "./pages/marketing/Landing";
import Pricing from "./pages/marketing/Pricing";
import Features from "./pages/marketing/Features";
import About from "./pages/marketing/About";
import Contact from "./pages/marketing/Contact";
import Docs from "./pages/marketing/Docs";
import NotFoundMarketing from "./pages/marketing/NotFoundMarketing";
import Login from "./pages/Login";

// Path prefixes that belong to the authenticated dashboard app. Everything
// else is served by the public marketing site.
const APP_PREFIXES = ["/dashboard", "/invoices", "/clients"];

function isAppPath(location: string) {
  return APP_PREFIXES.some(
    prefix => location === prefix || location.startsWith(`${prefix}/`)
  );
}

/** Scroll to top on every navigation — marketing pages are long. */
function ScrollToTop() {
  const [location] = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);
  return null;
}

function MarketingArea() {
  return (
    <MarketingLayout>
      <Switch>
        <Route path="/" component={Landing} />
        <Route path="/features" component={Features} />
        <Route path="/pricing" component={Pricing} />
        <Route path="/about" component={About} />
        <Route path="/contact" component={Contact} />
        <Route path="/docs" component={Docs} />
        <Route component={NotFoundMarketing} />
      </Switch>
    </MarketingLayout>
  );
}

function AppArea() {
  return (
    <DashboardLayout>
      <Switch>
        <Route path="/dashboard" component={Home} />
        <Route path="/invoices" component={InvoicesPage} />
        <Route path="/invoices/new" component={CreateInvoicePage} />
        <Route path="/invoices/:id/edit" component={EditInvoicePage} />
        <Route path="/invoices/:id" component={InvoiceDetailPage} />
        <Route path="/clients" component={ClientsPage} />
        <Route path="/clients/new" component={CreateClientPage} />
        <Route path="/clients/:id/edit" component={EditClientPage} />
        <Route path="/clients/:id" component={ClientDetailPage} />
        <Route component={NotFound} />
      </Switch>
    </DashboardLayout>
  );
}

function Router() {
  const [location] = useLocation();
  if (location === "/login") return <Login />;
  return isAppPath(location) ? <AppArea /> : <MarketingArea />;
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <ScrollToTop />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
