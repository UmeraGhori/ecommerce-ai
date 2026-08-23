// Evidence Ledger design reminder: AtlasDesk is a dark, evidence-led local demo with a single focused workbench route.
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import SyncPilot from "./pages/SyncPilot";
import LumaStore from "./pages/LumaStore";
import "./atlas-refinements.css";

function Router() {
  return <Switch><Route path="/" component={Home} /><Route path="/syncpilot" component={SyncPilot} /><Route path="/luma" component={LumaStore} /><Route path="/404" component={NotFound} /><Route component={NotFound} /></Switch>;
}

export default function App() {
  return <ErrorBoundary><ThemeProvider defaultTheme="dark"><TooltipProvider><Toaster richColors position="top-right" /><Router /></TooltipProvider></ThemeProvider></ErrorBoundary>;
}
