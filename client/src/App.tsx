import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Navbar } from "@/components/layout/navbar";
import { AuthProvider } from "@/hooks/use-auth";
import Home from "@/pages/home";
import Browser from "@/pages/browser";
import Den from "@/pages/den";
import Auth from "@/pages/auth";
import ArtworkPage from "@/pages/artwork";
import UserPage from "@/pages/user";
import ProfilePage from "@/pages/profile";
import GalleryPage from "@/pages/gallery";
import NotFound from "@/pages/not-found";
import { ProtectedRoute } from "./lib/protected-route";
import BrowsePage from "@/pages/browse";
import ArtistsPage from "@/pages/artists";


function Router() {
  return (
    <Switch>
      <Route path="/" component={() => <Redirect to="/browse" />} /> {/* Changed redirect to /browse */}
      <Route path="/auth" component={Auth} />
      <Route path="/browse" component={BrowsePage} />
      <Route path="/artists" component={ArtistsPage} />
      <Route path="/browser" component={Browser} />
      <Route path="/artwork/:id" component={ArtworkPage} />
      <Route path="/profile/:id" component={ProfilePage} />
      <Route path="/user/:id" component={UserPage} />
      <Route path="/gallery/:id" component={GalleryPage} />
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