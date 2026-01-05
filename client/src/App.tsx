import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { AppProvider } from "@/lib/store";
import { MobileLayout } from "@/components/layout/MobileLayout";
import Home from "@/pages/Home";
import Buckets from "@/pages/Buckets";
import Store from "@/pages/Store";
import Archive from "@/pages/Archive";
import Settings from "@/pages/Settings";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <MobileLayout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/buckets" component={Buckets} />
        <Route path="/store" component={Store} />
        <Route path="/archive" component={Archive} />
        <Route path="/settings" component={Settings} />
        <Route component={NotFound} />
      </Switch>
    </MobileLayout>
  );
}

function App() {
  return (
    <AppProvider>
      <Toaster />
      <Router />
    </AppProvider>
  );
}

export default App;
