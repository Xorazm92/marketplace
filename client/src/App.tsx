import { Switch, Route, Redirect } from "wouter";
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
import Login from "@/pages/Login";
import Register from "@/pages/Register";

// Protected Route Component
function ProtectedRoute({ children, requiredRole, redirectTo = '/' }: { 
  children: React.ReactNode; 
  requiredRole?: 'admin' | 'seller' | 'buyer';
  redirectTo?: string;
}) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Redirect to="/login" />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Redirect to={redirectTo} />;
  }

  return <>{children}</>;
}

function Router() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Switch>
      {/* Public routes */}
      <Route path="/" component={Landing} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/category/:slug" component={Category} />
      <Route path="/product/:id" component={ProductDetail} />

      {/* Protected routes */}
      <Route path="/dashboard">
        <ProtectedRoute>
          <UserDashboard />
        </ProtectedRoute>
      </Route>

      <Route path="/seller">
        <ProtectedRoute requiredRole="seller">
          <SellerDashboard />
        </ProtectedRoute>
      </Route>

      <Route path="/admin">
        <ProtectedRoute requiredRole="admin">
          <AdminPanel />
        </ProtectedRoute>
      </Route>

      {/* 404 */}
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
