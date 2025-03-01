import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Navbar } from "@/components/layout/navbar";
import { AuthProvider } from "@/hooks/use-auth";
import Home from "@/pages/home";
import Browser from "@/pages/browser";
import Editor from "@/pages/editor";
import Den from "@/pages/den";
import Auth from "@/pages/auth";
import NotFound from "@/pages/not-found";
import { ProtectedRoute } from "./lib/protected-route";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/auth" component={Auth} />
      <Route path="/browser" component={Browser} />
      <ProtectedRoute path="/editor" component={Editor} />
      <ProtectedRoute path="/den/:id" component={Den} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <div className="min-h-screen bg-[#1A1A2E] text-white">
          <Navbar />
          <main>
            <Router />
          </main>
        </div>
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;