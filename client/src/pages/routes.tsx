
import { Switch as RouterSwitch, Route } from "wouter";
import Home from "./home";
import Login from "./login";
import Register from "./register";
import Den from "./den";
import Gallery from "./gallery";
import ArtworkDetails from "./artwork-details";
import AdminPanel from "./admin";
import NotFound from "./not-found";

export default function AppRoutes() {
  return (
    <RouterSwitch>
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/den/:userId?" component={Den} />
      <Route path="/gallery/:id" component={Gallery} />
      <Route path="/artwork/:id" component={ArtworkDetails} />
      <Route path="/admin" component={AdminPanel} />
      <Route component={NotFound} />
    </RouterSwitch>
  );
}

