import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./app/App";
import { AuthProvider } from "./app/context/AuthContext";
import { OnboardingProvider } from "./app/context/OnboardingContext";
import { ErrorBoundary } from "./app/components/ErrorBoundary";
import "./styles/index.css";

console.log("🚀 main.tsx: App initialization starting...");

const rootElement = document.getElementById("root");
console.log("📍 main.tsx: Root element found:", !!rootElement);

if (!rootElement) {
  console.error("❌ main.tsx: Root element not found!");
  document.body.innerHTML = '<div style="padding: 20px; color: red;"><h1>Error: Root element not found</h1></div>';
} else {
  console.log("✅ main.tsx: Starting React render...");
  
  createRoot(rootElement).render(
    // WHY: Wrap the entire app in ErrorBoundary so unexpected runtime errors
    // don't crash the whole UI with a blank screen.
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <OnboardingProvider>
            <App />
          </OnboardingProvider>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
  
  console.log("✅ main.tsx: React app rendered successfully!");
}