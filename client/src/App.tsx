import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { CartProvider } from "@/context/CartContext";
import { LanguageProvider } from "@/context/LanguageContext";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/Landing";
import Home from "@/pages/Home";
import ProductDetail from "@/pages/ProductDetail";
import UserDashboard from "@/pages/UserDashboard";
import SellerDashboard from "@/pages/SellerDashboard";
import AdminPanel from "@/pages/AdminPanel";
import Category from "@/pages/Category";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/" component={Home} />
          <Route path="/product/:id" component={ProductDetail} />
          <Route path="/category/:slug" component={Category} />
          <Route path="/dashboard" component={UserDashboard} />
          <Route path="/seller" component={SellerDashboard} />
          <Route path="/admin" component={AdminPanel} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <LanguageProvider>
          <CartProvider>
            <Toaster />
            <Router />
          </CartProvider>
        </LanguageProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
