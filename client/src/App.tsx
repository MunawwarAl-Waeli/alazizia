/** ظلّ معماري هادئ: مسارات عامة واضحة، مع قالب موقع ثابت يمنع عزلة الصفحات الداخلية. */
import { lazy, Suspense } from "react";
import { Route, Switch } from "wouter";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import ErrorBoundary from "@/components/ErrorBoundary";
import { ThemeProvider } from "@/contexts/ThemeContext";
import SiteShell from "@/components/SiteShell";
const Home = lazy(() => import("@/pages/Home"));
const Services = lazy(() => import("@/pages/Services"));
const ServiceDetail = lazy(() => import("@/pages/ServiceDetail"));
const Gallery = lazy(() => import("@/pages/Gallery"));
const About = lazy(() => import("@/pages/About"));
const SiteMapPage = lazy(() => import("@/pages/SiteMapPage"));
const NotFound = lazy(() => import("@/pages/NotFound"));

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/services" component={Services} />
      <Route path="/services/:slug" component={ServiceDetail} />
      <Route path="/gallery" component={Gallery} />
      <Route path="/about" component={About} />
      <Route path="/sitemap" component={SiteMapPage} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}
export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <SiteShell>
            <Suspense
              fallback={
                <div className="route-loading">جارٍ تجهيز المحتوى…</div>
              }
            >
              <Router />
            </Suspense>
          </SiteShell>
          <Toaster richColors position="top-center" dir="rtl" />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
