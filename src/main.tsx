import { Toaster } from "@/components/ui/sonner";
import { InstrumentationProvider } from "@/instrumentation.tsx";
import AuthPage from "@/pages/Auth.tsx";
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { ConvexReactClient } from "convex/react";
import { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes, useLocation } from "react-router";
import "./index.css";
import Landing from "./pages/Landing.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import TravelLog from "./pages/TravelLog.tsx";
import NotFound from "./pages/NotFound.tsx";
import "./types/global.d.ts";

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string);

function RouteSyncer() {
  const location = useLocation();
  useEffect(() => {
    window.parent.postMessage(
      { type: "iframe-route-change", path: location.pathname },
      "*",
    );
  }, [location.pathname]);

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.data?.type === "navigate") {
        if (event.data.direction === "back") window.history.back();
        if (event.data.direction === "forward") window.history.forward();
      }
    }
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  // Set favicon to Compass icon and override any existing favicon
  useEffect(() => {
    const href = "/compass.svg";
    const ensureFavicon = () => {
      let link = document.querySelector('link[rel="icon"]') as HTMLLinkElement | null;
      if (!link) {
        link = document.createElement("link");
        link.rel = "icon";
        document.head.appendChild(link);
      }
      link.type = "image/svg+xml";
      link.href = href;

      // Also set shortcut icon for broader browser support
      let shortcut = document.querySelector('link[rel="shortcut icon"]') as HTMLLinkElement | null;
      if (!shortcut) {
        shortcut = document.createElement("link");
        shortcut.rel = "shortcut icon";
        document.head.appendChild(shortcut);
      }
      shortcut.type = "image/svg+xml";
      shortcut.href = href;
    };
    ensureFavicon();
  }, []);

  // Remove "Powered by Vly/Vli" badges injected by the host on deploy
  useEffect(() => {
    const removeBadge = () => {
      const nodes = Array.from(document.querySelectorAll("a, div, span")) as HTMLElement[];
      for (const el of nodes) {
        const text = (el.innerText || "").toLowerCase();
        const href = (el as HTMLAnchorElement).href || "";
        const hasPoweredText = text.includes("powered by") && (text.includes("vly") || text.includes("vli"));
        const hasVlyHref = href.includes("vly") || href.includes("vli");
        if (hasPoweredText || hasVlyHref) {
          const style = window.getComputedStyle(el);
          if (style.position === "fixed") {
            el.remove();
          }
        }
      }
    };
    const t1 = setTimeout(removeBadge, 0);
    const t2 = setTimeout(removeBadge, 1500);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  return null;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <InstrumentationProvider>
      <ConvexAuthProvider client={convex}>
        <BrowserRouter>
          <RouteSyncer />
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<AuthPage redirectAfterAuth="/dashboard" />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/travel-log/:id" element={<TravelLog />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        <Toaster />
      </ConvexAuthProvider>
    </InstrumentationProvider>
  </StrictMode>,
);